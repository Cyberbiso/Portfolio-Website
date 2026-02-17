import { NextRequest } from "next/server";
import { z } from "zod";
import cvKnowledgeRaw from "@/data/cv-knowledge.json";
import siteFactsRaw from "@/data/site-facts.json";
import { generateWithGemini, getGoogleAiConfig } from "@/lib/gemini";
import { buildSystemPrompt, buildUserPrompt, getAllowedCitations, parseModelResponse } from "@/lib/prompt";
import { enforceRateLimit, getRequestIp } from "@/lib/rate-limit";
import { insertAssistantError, insertChatLog } from "@/lib/supabase";
import type { CvKnowledge, SiteFacts } from "@/types/cv";

export const runtime = "nodejs";

const requestSchema = z.object({
  message: z.string().trim().min(1).max(800),
  sessionId: z.string().trim().min(6).max(120).optional(),
  source: z.literal("landing").optional()
});

const cvKnowledge = cvKnowledgeRaw as CvKnowledge;
const siteFacts = siteFactsRaw as SiteFacts;
const allowedCitations = getAllowedCitations(cvKnowledge);

interface StreamEventBase {
  type: "session" | "chunk" | "citations" | "done" | "error";
}

interface SessionEvent extends StreamEventBase {
  type: "session";
  sessionId: string;
}

interface ChunkEvent extends StreamEventBase {
  type: "chunk";
  text: string;
}

interface CitationsEvent extends StreamEventBase {
  type: "citations";
  citations: string[];
}

interface DoneEvent extends StreamEventBase {
  type: "done";
}

interface ErrorEvent extends StreamEventBase {
  type: "error";
  message: string;
}

type StreamEvent = SessionEvent | ChunkEvent | CitationsEvent | DoneEvent | ErrorEvent;

function answerToChunks(answer: string): string[] {
  const tokens = answer.match(/\S+\s*/g) ?? [answer];

  const chunks: string[] = [];
  for (let index = 0; index < tokens.length; index += 3) {
    chunks.push(tokens.slice(index, index + 3).join(""));
  }

  return chunks;
}

function createSseResponse(events: StreamEvent[]): Response {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      for (const event of events) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));

        if (event.type === "chunk") {
          await new Promise((resolve) => setTimeout(resolve, 12));
        }
      }

      controller.close();
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive"
    }
  });
}

export async function POST(request: NextRequest) {
  let payload: z.infer<typeof requestSchema>;

  try {
    payload = requestSchema.parse(await request.json());
  } catch {
    const errorResponse = [{ type: "error", message: "Invalid request payload." }, { type: "done" }] as StreamEvent[];
    return createSseResponse(errorResponse);
  }

  const sessionId = payload.sessionId ?? crypto.randomUUID();
  const ip = getRequestIp(request.headers.get("x-forwarded-for"));
  const userAgent = request.headers.get("user-agent");

  const rateLimit = await enforceRateLimit(ip);

  if (!rateLimit.allowed) {
    const events: StreamEvent[] = [
      { type: "session", sessionId },
      { type: "error", message: "Too many requests. Please wait a minute and try again." },
      { type: "done" }
    ];

    return createSseResponse(events);
  }

  const googleAiConfig = getGoogleAiConfig();

  if (!googleAiConfig) {
    const answer =
      "The assistant is temporarily unavailable because GOOGLE_AI_API_KEY is missing. Please configure server environment variables.";

    await insertChatLog({
      sessionId,
      question: payload.message,
      answer,
      citations: [],
      ipHash: rateLimit.ipHash,
      userAgent
    });

    const events: StreamEvent[] = [
      { type: "session", sessionId },
      ...answerToChunks(answer).map((text) => ({ type: "chunk", text }) as ChunkEvent),
      { type: "citations", citations: [] },
      { type: "done" }
    ];

    return createSseResponse(events);
  }

  let answer = "";
  let citations: string[] = [];

  try {
    const rawMessage = await generateWithGemini(
      buildSystemPrompt(cvKnowledge, siteFacts),
      buildUserPrompt(payload.message)
    );

    const parsed = parseModelResponse(rawMessage, allowedCitations);
    answer = parsed.answer;
    citations = parsed.citations;
  } catch (error) {
    answer = "I hit a temporary issue while generating that answer. Please ask again in a moment.";

    await insertAssistantError("chat_generation_failed", {
      reason: error instanceof Error ? error.message : "unknown_error",
      provider: "google_ai",
      model: googleAiConfig.model,
      sessionId
    });
  }

  await insertChatLog({
    sessionId,
    question: payload.message,
    answer,
    citations,
    ipHash: rateLimit.ipHash,
    userAgent
  });

  const events: StreamEvent[] = [
    { type: "session", sessionId },
    ...answerToChunks(answer).map((text) => ({ type: "chunk", text }) as ChunkEvent),
    { type: "citations", citations },
    { type: "done" }
  ];

  return createSseResponse(events);
}

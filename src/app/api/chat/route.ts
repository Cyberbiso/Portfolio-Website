import { NextRequest, NextResponse } from "next/server";
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

export async function POST(request: NextRequest) {
  let payload: z.infer<typeof requestSchema>;

  try {
    payload = requestSchema.parse(await request.json());
  } catch {
    return NextResponse.json(
      {
        error: "Invalid request payload. Provide a message between 1 and 800 characters."
      },
      { status: 400 }
    );
  }

  const sessionId = payload.sessionId ?? crypto.randomUUID();
  const ip = getRequestIp(request.headers.get("x-forwarded-for"));
  const userAgent = request.headers.get("user-agent");

  const rateLimit = await enforceRateLimit(ip);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: "Too many requests. Please wait a minute and try again.",
        sessionId
      },
      { status: 429 }
    );
  }

  const googleAiConfig = getGoogleAiConfig();

  if (!googleAiConfig) {
    const unavailableAnswer =
      "The assistant is temporarily unavailable because GOOGLE_AI_API_KEY is missing. Please configure server environment variables.";

    await insertChatLog({
      sessionId,
      question: payload.message,
      answer: unavailableAnswer,
      citations: [],
      ipHash: rateLimit.ipHash,
      userAgent
    });

    return NextResponse.json({
      answer: unavailableAnswer,
      citations: [],
      sessionId
    });
  }

  try {
    const rawMessage = await generateWithGemini(
      buildSystemPrompt(cvKnowledge, siteFacts),
      buildUserPrompt(payload.message)
    );

    const parsed = parseModelResponse(rawMessage, allowedCitations);

    await insertChatLog({
      sessionId,
      question: payload.message,
      answer: parsed.answer,
      citations: parsed.citations,
      ipHash: rateLimit.ipHash,
      userAgent
    });

    return NextResponse.json({
      answer: parsed.answer,
      citations: parsed.citations,
      sessionId
    });
  } catch (error) {
    const fallbackAnswer =
      "I hit a temporary issue while generating that answer. Please ask again in a moment.";

    await insertAssistantError("chat_generation_failed", {
      reason: error instanceof Error ? error.message : "unknown_error",
      provider: "google_ai",
      model: googleAiConfig.model,
      sessionId
    });

    await insertChatLog({
      sessionId,
      question: payload.message,
      answer: fallbackAnswer,
      citations: [],
      ipHash: rateLimit.ipHash,
      userAgent
    });

    return NextResponse.json({
      answer: fallbackAnswer,
      citations: [],
      sessionId
    });
  }
}

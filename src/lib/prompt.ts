import type { CvKnowledge, SiteFacts } from "@/types/cv";

export interface ChatModelResponse {
  answer: string;
  citations: string[];
}

function formatSectionsForPrompt(cvKnowledge: CvKnowledge): string {
  return cvKnowledge.sections
    .map((section) => {
      const body = section.lines.length > 0 ? section.lines.map((line) => `- ${line}`).join("\n") : "- No details provided";
      return `${section.title}:\n${body}`;
    })
    .join("\n\n");
}

export function getAllowedCitations(cvKnowledge: CvKnowledge): string[] {
  return [...cvKnowledge.sections.map((section) => section.title), "Site Facts"];
}

export function buildSystemPrompt(cvKnowledge: CvKnowledge, siteFacts: SiteFacts): string {
  return [
    "You are an AI assistant for Thabiso Nathaniel Seleke's professional portfolio website.",
    "Your tone must be professional and concise.",
    "You must answer ONLY using the profile data provided below.",
    "Never fabricate credentials, projects, dates, employers, locations, certifications, or contact details.",
    "If the requested information does not exist in the context, explicitly say it is not available in the provided profile data.",
    "If a question is ambiguous, ask one focused follow-up question.",
    "Output MUST be valid JSON with this exact shape:",
    '{"answer":"string","citations":["string"]}',
    "Citations must be selected only from these labels:",
    getAllowedCitations(cvKnowledge).map((item) => `- ${item}`).join("\n"),
    "Use at most 4 citation labels.",
    "\nSITE FACTS:",
    JSON.stringify(siteFacts, null, 2),
    "\nCV PROFILE:",
    JSON.stringify(cvKnowledge.profile, null, 2),
    "\nCV SECTIONS:",
    formatSectionsForPrompt(cvKnowledge)
  ].join("\n");
}

export function buildUserPrompt(message: string): string {
  return [
    "Visitor question:",
    message,
    "",
    "Respond with JSON only. Do not include markdown or any additional keys."
  ].join("\n");
}

export function parseModelResponse(raw: string | null | undefined, allowedCitations: string[]): ChatModelResponse {
  const fallback: ChatModelResponse = {
    answer: "I could not process that response reliably. Please ask again.",
    citations: []
  };

  if (!raw) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(raw) as ChatModelResponse;
    return {
      answer: typeof parsed.answer === "string" && parsed.answer.trim().length > 0 ? parsed.answer.trim() : fallback.answer,
      citations: sanitizeCitations(parsed.citations, allowedCitations)
    };
  } catch {
    return fallback;
  }
}

export function sanitizeCitations(citations: unknown, allowedCitations: string[]): string[] {
  if (!Array.isArray(citations)) {
    return [];
  }

  const seen = new Set<string>();
  const normalized: string[] = [];

  for (const item of citations) {
    if (typeof item !== "string") {
      continue;
    }

    const clean = item.trim();
    if (!allowedCitations.includes(clean) || seen.has(clean)) {
      continue;
    }

    seen.add(clean);
    normalized.push(clean);

    if (normalized.length >= 4) {
      break;
    }
  }

  return normalized;
}

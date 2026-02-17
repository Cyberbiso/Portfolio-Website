export interface GeminiContentPart {
  text?: string;
}

export interface GeminiCandidate {
  content?: {
    parts?: GeminiContentPart[];
  };
}

export interface GeminiGenerateContentResponse {
  candidates?: GeminiCandidate[];
}

export interface GoogleAiConfig {
  apiKey: string;
  model: string;
}

export function getGoogleAiConfig(): GoogleAiConfig | null {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  const model = process.env.GOOGLE_AI_MODEL ?? "gemini-2.5-flash";

  if (!apiKey) {
    return null;
  }

  return { apiKey, model };
}

export async function generateWithGemini(systemPrompt: string, userPrompt: string): Promise<string | null> {
  const config = getGoogleAiConfig();

  if (!config) {
    return null;
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(config.model)}:generateContent?key=${encodeURIComponent(config.apiKey)}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      systemInstruction: {
        role: "system",
        parts: [{ text: systemPrompt }]
      },
      contents: [
        {
          role: "user",
          parts: [{ text: userPrompt }]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json"
      }
    })
  });

  if (!response.ok) {
    const failureText = await response.text();
    throw new Error(`google_ai_http_${response.status}: ${failureText.slice(0, 500)}`);
  }

  const payload = (await response.json()) as GeminiGenerateContentResponse;
  const parts = payload.candidates?.[0]?.content?.parts ?? [];
  const textPart = parts.find((part) => typeof part.text === "string" && part.text.trim().length > 0);

  return textPart?.text ?? null;
}

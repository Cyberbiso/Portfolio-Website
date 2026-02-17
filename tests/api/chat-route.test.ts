import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const fetchMock = vi.fn();
const enforceRateLimitMock = vi.fn();
const insertChatLogMock = vi.fn();
const insertAssistantErrorMock = vi.fn();

vi.stubGlobal("fetch", fetchMock);

vi.mock("@/lib/rate-limit", () => ({
  enforceRateLimit: enforceRateLimitMock,
  getRequestIp: vi.fn().mockReturnValue("127.0.0.1")
}));

vi.mock("@/lib/supabase", () => ({
  insertChatLog: insertChatLogMock,
  insertAssistantError: insertAssistantErrorMock
}));

describe("POST /api/chat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("GOOGLE_AI_API_KEY", "test-google-key");
    vi.stubEnv("GOOGLE_AI_MODEL", "gemini-2.5-flash");

    enforceRateLimitMock.mockResolvedValue({
      allowed: true,
      remaining: 9,
      ipHash: "hashed-ip"
    });

    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify({
                      answer: "Thabiso works with Java and Angular.",
                      citations: ["Skills"]
                    })
                  }
                ]
              }
            }
          ]
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json"
          }
        }
      )
    );
  });

  it("returns answer, citations and sessionId for valid payload", async () => {
    const { POST } = await import("@/app/api/chat/route");
    const request = new NextRequest("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({ message: "What technologies does Thabiso use?", source: "landing" }),
      headers: {
        "content-type": "application/json"
      }
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.answer).toContain("Java and Angular");
    expect(payload.citations).toEqual(["Skills"]);
    expect(typeof payload.sessionId).toBe("string");
    expect(insertChatLogMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("rejects invalid payload", async () => {
    const { POST } = await import("@/app/api/chat/route");
    const request = new NextRequest("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({ message: "" }),
      headers: {
        "content-type": "application/json"
      }
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toContain("Invalid request payload");
  });

  it("returns grounded fallback for out-of-context response", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify({
                      answer: "That detail is not available in the provided profile data.",
                      citations: []
                    })
                  }
                ]
              }
            }
          ]
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json"
          }
        }
      )
    );

    const { POST } = await import("@/app/api/chat/route");
    const request = new NextRequest("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({ message: "What is Thabiso's exact hourly rate?", source: "landing" }),
      headers: {
        "content-type": "application/json"
      }
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.answer).toContain("not available in the provided profile data");
    expect(payload.citations).toEqual([]);
  });
});

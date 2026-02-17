import { beforeEach, describe, expect, it, vi } from "vitest";
import { enforceRateLimit } from "@/lib/rate-limit";

describe("rate limit fallback", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.stubEnv("SUPABASE_URL", "");
    vi.stubEnv("SUPABASE_ANON_KEY", "");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");
    vi.stubEnv("RATE_LIMIT_PER_MINUTE", "2");
    vi.stubEnv("RATE_LIMIT_SALT", "test-salt");

    const globalRef = globalThis as typeof globalThis & { __rateLimitStore?: Map<string, number[]> };
    globalRef.__rateLimitStore = new Map();
  });

  it("blocks requests after per-minute threshold", async () => {
    const first = await enforceRateLimit("198.51.100.8");
    const second = await enforceRateLimit("198.51.100.8");
    const third = await enforceRateLimit("198.51.100.8");

    expect(first.allowed).toBe(true);
    expect(second.allowed).toBe(true);
    expect(third.allowed).toBe(false);
  });
});

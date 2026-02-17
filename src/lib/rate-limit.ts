import { createHash } from "node:crypto";
import { getSupabaseServerClient } from "@/lib/supabase";

interface RateLimitState {
  allowed: boolean;
  remaining: number;
  ipHash: string;
}

type MemoryStore = Map<string, number[]>;

function getMemoryStore(): MemoryStore {
  const globalRef = globalThis as typeof globalThis & { __rateLimitStore?: MemoryStore };
  if (!globalRef.__rateLimitStore) {
    globalRef.__rateLimitStore = new Map<string, number[]>();
  }
  return globalRef.__rateLimitStore;
}

function hashIp(ip: string): string {
  const salt = process.env.RATE_LIMIT_SALT ?? "default-rate-limit-salt";
  return createHash("sha256").update(`${ip}:${salt}`).digest("hex");
}

function getLimitPerMinute(): number {
  const parsed = Number(process.env.RATE_LIMIT_PER_MINUTE ?? "10");
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 10;
}

async function checkMemoryRateLimit(ipHash: string): Promise<RateLimitState> {
  const store = getMemoryStore();
  const now = Date.now();
  const oneMinuteAgo = now - 60_000;
  const limit = getLimitPerMinute();

  const recent = (store.get(ipHash) ?? []).filter((timestamp) => timestamp >= oneMinuteAgo);

  if (recent.length >= limit) {
    store.set(ipHash, recent);
    return { allowed: false, remaining: 0, ipHash };
  }

  recent.push(now);
  store.set(ipHash, recent);

  return {
    allowed: true,
    remaining: Math.max(0, limit - recent.length),
    ipHash
  };
}

export function getRequestIp(forwardedFor: string | null, fallbackIp = "unknown"): string {
  if (!forwardedFor || forwardedFor.trim().length === 0) {
    return fallbackIp;
  }

  return forwardedFor.split(",")[0].trim() || fallbackIp;
}

export async function enforceRateLimit(ip: string): Promise<RateLimitState> {
  const ipHash = hashIp(ip);
  const limit = getLimitPerMinute();
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return checkMemoryRateLimit(ipHash);
  }

  const now = new Date();
  const windowStart = new Date(now.getTime() - 60_000).toISOString();

  const { count, error: countError } = await supabase
    .from("rate_limit_events")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", windowStart);

  if (countError) {
    console.error("Rate limit count check failed, using memory fallback:", countError.message);
    return checkMemoryRateLimit(ipHash);
  }

  const currentCount = count ?? 0;

  if (currentCount >= limit) {
    return {
      allowed: false,
      remaining: 0,
      ipHash
    };
  }

  const { error: insertError } = await supabase.from("rate_limit_events").insert({ ip_hash: ipHash });

  if (insertError) {
    console.error("Rate limit insert failed, using memory fallback:", insertError.message);
    return checkMemoryRateLimit(ipHash);
  }

  return {
    allowed: true,
    remaining: Math.max(0, limit - (currentCount + 1)),
    ipHash
  };
}

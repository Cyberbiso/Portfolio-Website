import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cachedClient: SupabaseClient | null | undefined;

function getSupabaseKey(): string | undefined {
  return process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;
}

export function getSupabaseServerClient(): SupabaseClient | null {
  if (cachedClient !== undefined) {
    return cachedClient;
  }

  const url = process.env.SUPABASE_URL;
  const key = getSupabaseKey();

  if (!url || !key) {
    cachedClient = null;
    return cachedClient;
  }

  cachedClient = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });

  return cachedClient;
}

export interface ChatLogInput {
  sessionId: string;
  question: string;
  answer: string;
  citations: string[];
  ipHash: string;
  userAgent: string | null;
}

export async function insertChatLog(input: ChatLogInput): Promise<void> {
  const client = getSupabaseServerClient();

  if (!client) {
    return;
  }

  const { error } = await client.from("chat_logs").insert({
    session_id: input.sessionId,
    question: input.question,
    answer: input.answer,
    citations: input.citations,
    ip_hash: input.ipHash,
    user_agent: input.userAgent
  });

  if (error) {
    console.error("Failed to insert chat log:", error.message);
  }
}

export async function insertAssistantError(errorMessage: string, metadata: Record<string, unknown>): Promise<void> {
  const client = getSupabaseServerClient();

  if (!client) {
    console.error("Assistant error (no Supabase):", errorMessage, metadata);
    return;
  }

  const { error } = await client.from("assistant_error_logs").insert({
    error_message: errorMessage,
    metadata
  });

  if (error) {
    console.error("Failed to insert assistant error log:", error.message);
  }
}

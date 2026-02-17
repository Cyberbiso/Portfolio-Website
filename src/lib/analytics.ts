"use client";

export type AnalyticsEvent =
  | "page_view"
  | "chat_started"
  | "chat_message_sent"
  | "cta_email_click"
  | "cta_linkedin_click"
  | "cv_download_click";

export async function trackEvent(event: AnalyticsEvent, metadata: Record<string, unknown> = {}): Promise<void> {
  try {
    await fetch("/api/analytics", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ event, metadata }),
      keepalive: true
    });
  } catch {
    // Analytics must never block user interactions.
  }
}

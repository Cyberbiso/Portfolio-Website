import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

const analyticsSchema = z.object({
  event: z.enum([
    "page_view",
    "chat_started",
    "chat_message_sent",
    "cta_email_click",
    "cta_linkedin_click",
    "cv_download_click"
  ]),
  metadata: z.record(z.unknown()).optional()
});

export async function POST(request: NextRequest) {
  try {
    const body = analyticsSchema.parse(await request.json());
    console.info("analytics_event", {
      event: body.event,
      metadata: body.metadata ?? null,
      at: new Date().toISOString()
    });

    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "Invalid analytics payload" }, { status: 400 });
  }
}

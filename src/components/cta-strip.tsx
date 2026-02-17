"use client";

import { trackEvent } from "@/lib/analytics";

interface CtaStripProps {
  email: string;
  linkedinUrl: string;
  emailLabel: string;
  linkedinLabel: string;
}

export function CtaStrip({ email, linkedinUrl, emailLabel, linkedinLabel }: CtaStripProps) {
  return (
    <section className="glass-dark rounded-3xl p-8 text-white shadow-panel">
      <h3 className="text-2xl">Let&apos;s build something useful</h3>
      <p className="mt-2 max-w-2xl text-sm text-white/75">
        If you need a developer for full-stack delivery, API work, or AI-assisted product features, start a direct
        conversation.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href={`mailto:${email}`}
          onClick={() => {
            void trackEvent("cta_email_click", { source: "cta_strip" });
          }}
          className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#0b1a2e] transition hover:-translate-y-0.5 hover:bg-[#e8eef8]"
        >
          {emailLabel}
        </a>
        <a
          href={linkedinUrl}
          target="_blank"
          rel="noreferrer"
          onClick={() => {
            void trackEvent("cta_linkedin_click", { source: "cta_strip" });
          }}
          className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/15"
        >
          {linkedinLabel}
        </a>
      </div>
    </section>
  );
}

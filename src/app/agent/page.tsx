import Link from "next/link";
import { AnalyticsBeacon } from "@/components/analytics-beacon";
import { ChatPanel } from "@/components/chat-panel";
import { ParallaxCard } from "@/components/parallax-card";
import { RevealBlock } from "@/components/reveal-block";
import { siteFacts } from "@/lib/profile-data";

export default function AgentPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 pb-16 pt-6 md:px-8">
      <AnalyticsBeacon />

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <RevealBlock delayMs={0}>
          <ParallaxCard intensity={5} tilt={1.2} scrollLift={5}>
            <ChatPanel />
          </ParallaxCard>
        </RevealBlock>

        <RevealBlock delayMs={90}>
          <article className="section-card rounded-3xl p-7 shadow-panel">
            <p className="inline-flex rounded-full border border-ink/15 bg-[#eff4fb] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
              Agent
            </p>
            <h1 className="mt-4 text-3xl text-ink md:text-4xl">Profile Q&A Assistant</h1>
            <p className="mt-3 text-sm leading-relaxed text-slate">
              Ask about experience, skills, certifications, and collaboration fit. Responses are grounded in CV data and
              curated portfolio facts only.
            </p>

            <h2 className="mt-6 text-lg text-ink">Quick Navigation</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href="/about"
                className="rounded-full border border-ink/20 bg-white px-4 py-2 text-xs font-semibold text-ink transition hover:border-ink/40"
              >
                View About
              </Link>
              <Link
                href="/portfolio"
                className="rounded-full border border-ink/20 bg-white px-4 py-2 text-xs font-semibold text-ink transition hover:border-ink/40"
              >
                View Portfolio
              </Link>
              <a
                href={`mailto:${siteFacts.email}`}
                className="rounded-full border border-ink/20 bg-white px-4 py-2 text-xs font-semibold text-ink transition hover:border-ink/40"
              >
                Email Directly
              </a>
            </div>
          </article>
        </RevealBlock>
      </section>
    </main>
  );
}

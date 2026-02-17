import Image from "next/image";
import Link from "next/link";
import { AnalyticsBeacon } from "@/components/analytics-beacon";
import { CtaStrip } from "@/components/cta-strip";
import { CvDownloadButton } from "@/components/cv-download-button";
import { ParallaxCard } from "@/components/parallax-card";
import { RevealBlock } from "@/components/reveal-block";
import { siteFacts } from "@/lib/profile-data";

const featureCards = [
  {
    title: "About",
    description:
      "Background, experience highlights, certifications, and core technical strengths.",
    href: "/about",
  },
  {
    title: "Portfolio",
    description:
      "Project work from Cyberbiso, including Java systems and React experiences.",
    href: "/portfolio",
  },
  {
    title: "Agent",
    description:
      "Ask profile questions and get grounded answers from CV and curated facts.",
    href: "/agent",
  },
] as const;

export default function HomePage() {
  return (
    <main className="mx-auto max-w-7xl px-4 pb-16 pt-6 md:px-8">
      <AnalyticsBeacon />

      <section className="hero-grid">
        <RevealBlock delayMs={0} className="h-full">
          <ParallaxCard
            className="h-full"
            intensity={7}
            tilt={1.8}
            scrollLift={5}
          >
            <div className="glass-dark rounded-3xl p-8 text-white shadow-panel md:p-10">
              <p className="inline-flex rounded-full border border-white/30 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/85">
                Developer + AI Agent Portfolio
              </p>
              <h1 className="mt-5 max-w-3xl text-4xl leading-tight text-balance md:text-5xl">
                {siteFacts.name}
                <span className="mt-2 block text-2xl font-semibold text-[#d3e7ff] md:text-3xl">
                  {siteFacts.role}
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/85 md:text-lg">
                {siteFacts.tagline}
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <CvDownloadButton label={siteFacts.cta.cvLabel} />
                <Link
                  href="/agent"
                  className="inline-flex items-center justify-center rounded-full border border-white/35 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/15"
                >
                  Talk With Agent
                </Link>
              </div>
            </div>
          </ParallaxCard>
        </RevealBlock>

        <RevealBlock delayMs={100}>
          <ParallaxCard intensity={8} tilt={2.2} scrollLift={7}>
            <article className="section-card relative overflow-hidden rounded-3xl p-4 shadow-panel">
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
                <Image
                  src="/images/thabiso-portrait-hero.jpg"
                  alt="Portrait of Thabiso Seleke outdoors"
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 34vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a1422]/60 via-transparent to-transparent" />
              </div>
              <div className="absolute bottom-8 left-8 right-8 rounded-2xl border border-white/30 bg-black/40 px-4 py-3 text-sm text-white backdrop-blur-sm">
                <p className="font-semibold">
                  Open to collaboration and product development conversations
                </p>
                <p className="mt-1 text-xs text-white/80">
                  Fast delivery, clean architecture, and practical AI
                  integrations.
                </p>
              </div>
            </article>
          </ParallaxCard>
        </RevealBlock>
      </section>

      <section className="mt-8 grid gap-6 md:grid-cols-3">
        {featureCards.map((feature, index) => (
          <RevealBlock key={feature.title} delayMs={index * 70 + 40}>
            <ParallaxCard intensity={4} tilt={0.8} scrollLift={3}>
              <article className="section-card rounded-3xl p-6 shadow-panel">
                <h2 className="text-2xl text-ink">{feature.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-slate">
                  {feature.description}
                </p>
                <Link
                  href={feature.href}
                  className="mt-5 inline-flex rounded-full border border-ink/20 bg-white px-4 py-2 text-xs font-semibold text-ink transition hover:-translate-y-0.5 hover:border-ink/40"
                >
                  Go to {feature.title}
                </Link>
              </article>
            </ParallaxCard>
          </RevealBlock>
        ))}
      </section>

      <section className="mt-8">
        <RevealBlock delayMs={70}>
          <CtaStrip
            email={siteFacts.email}
            linkedinUrl={siteFacts.linkedinUrl}
            emailLabel={siteFacts.cta.emailLabel}
            linkedinLabel={siteFacts.cta.linkedinLabel}
          />
        </RevealBlock>
      </section>
    </main>
  );
}

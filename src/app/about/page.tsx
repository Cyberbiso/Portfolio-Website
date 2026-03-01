import Image from "next/image";
import { ParallaxCard } from "@/components/parallax-card";
import { RevealBlock } from "@/components/reveal-block";
import { getSectionLines, siteFacts } from "@/lib/profile-data";

const ABOUT_CARD_TEXT =
  "Detail-oriented Java and Angular Developer with experience in developing and optimizing web applications. Skilled in designing RESTful APIs, managing databases, and implementing efficient data structures. Recently expanded expertise to AI development, with a keen interest in LLMs and modern AI applications. Proven ability to collaborate effectively with cross-functional teams to deliver high-quality software solutions. Fluent in English, French, and Setswana, with strong communication and problem-solving skills.";

const EXPERIENCE_HIGHLIGHTS = [
  "Java and Angular Developer",
  "SAiS (Software Application & Information Solutions), Gaborone, Botswana",
  "August 2023 - Present",
  "Completed dashboard applications with RESTful API integration.",
  "Developed full functional full-stack features for Botswana Life.",
  "Designed and implemented RESTful APIs for data manipulation in web applications.",
  "Implemented pagination to improve data accessibility and navigation.",
  "Developed and optimized SQL queries and database structures for efficient data storage and retrieval."
] as const;

export default function AboutPage() {
  const skills = getSectionLines("Skills");
  const education = getSectionLines("Education");
  const certifications = getSectionLines("Certifications");

  return (
    <main className="mx-auto max-w-7xl px-4 pb-16 pt-6 md:px-8">
      <section className="hero-grid">
        <RevealBlock delayMs={0} className="h-full">
          <article className="glass-dark rounded-3xl p-8 text-white shadow-panel md:p-10">
            <p className="inline-flex rounded-full border border-white/30 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/85">
              About
            </p>
            <h1 className="mt-4 text-4xl leading-tight md:text-5xl">{siteFacts.name}</h1>
            <p className="mt-4 text-base leading-relaxed text-white/85 md:text-lg">
              {ABOUT_CARD_TEXT}
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <article className="rounded-2xl border border-white/20 bg-white/5 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.14em] text-white/65">Location</p>
                <p className="mt-1 text-sm font-semibold">{siteFacts.location}</p>
              </article>
              <article className="rounded-2xl border border-white/20 bg-white/5 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.14em] text-white/65">Role</p>
                <p className="mt-1 text-sm font-semibold">{siteFacts.role}</p>
              </article>
            </div>
          </article>
        </RevealBlock>

        <div className="space-y-4">
          <RevealBlock delayMs={90}>
            <ParallaxCard intensity={7} tilt={1.9} scrollLift={5}>
              <article className="section-card relative overflow-hidden rounded-3xl p-4 shadow-panel">
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
                  <Image
                    src="/images/thabiso-scene.jpg"
                    alt="Thabiso Seleke mirror portrait"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 36vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a1422]/50 via-transparent to-transparent" />
                </div>
              </article>
            </ParallaxCard>
          </RevealBlock>
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <RevealBlock delayMs={40}>
          <article className="section-card rounded-3xl p-7 shadow-panel">
            <h2 className="text-2xl text-ink">Experience Highlights</h2>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-slate">
              {EXPERIENCE_HIGHLIGHTS.map((item) => (
                <li key={item} className="rounded-xl border border-ink/10 bg-white/70 px-3 py-2">
                  {item}
                </li>
              ))}
            </ul>
          </article>
        </RevealBlock>

        <RevealBlock delayMs={110}>
          <article className="section-card rounded-3xl p-7 shadow-panel">
            <h2 className="text-2xl text-ink">Core Skills</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span key={skill} className="rounded-full border border-ink/15 bg-[#eff4fb] px-3 py-1 text-xs text-slate">
                  {skill}
                </span>
              ))}
            </div>
          </article>
        </RevealBlock>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <RevealBlock delayMs={40}>
          <article className="section-card rounded-3xl p-7 shadow-panel">
            <h2 className="text-2xl text-ink">Education</h2>
            <ul className="mt-4 space-y-2 text-sm text-slate">
              {education.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </RevealBlock>

        <RevealBlock delayMs={110}>
          <article className="section-card rounded-3xl p-7 shadow-panel">
            <h2 className="text-2xl text-ink">Certifications</h2>
            <ul className="mt-4 space-y-2 text-sm text-slate">
              {certifications.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </RevealBlock>
      </section>
    </main>
  );
}

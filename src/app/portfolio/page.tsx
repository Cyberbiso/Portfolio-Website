import Image from "next/image";
import { ParallaxCard } from "@/components/parallax-card";
import { RevealBlock } from "@/components/reveal-block";
import { portfolioProjects } from "@/data/projects";

export default function PortfolioPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 pb-16 pt-6 md:px-8">
      <RevealBlock delayMs={0}>
        <section className="glass-dark rounded-3xl p-8 text-white shadow-panel md:p-10">
          <p className="inline-flex rounded-full border border-white/30 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/85">
            Portfolio
          </p>
          <h1 className="mt-4 text-4xl md:text-5xl">Project Work</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/85 md:text-lg">
            A selection of builds from Cyberbiso spanning Java systems, React apps, AI web experiences, and creative
            interactive work.
          </p>
        </section>
      </RevealBlock>

      <section className="mt-8 grid gap-6 md:grid-cols-2">
        {portfolioProjects.map((project, index) => (
          <RevealBlock key={project.repo} delayMs={index * 70 + 30}>
            <ParallaxCard intensity={4.5} tilt={1} scrollLift={3}>
              <article className="section-card overflow-hidden rounded-3xl shadow-panel">
                <div className="relative aspect-[16/10]">
                  <Image
                    src={project.image}
                    alt={`${project.title} project artwork`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>

                <div className="p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">{project.repo}</p>
                  <h2 className="mt-2 text-2xl text-ink">{project.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate">{project.description}</p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {project.stack.map((item) => (
                      <span key={item} className="rounded-full border border-ink/15 bg-[#eff4fb] px-3 py-1 text-xs text-slate">
                        {item}
                      </span>
                    ))}
                  </div>

                  <a
                    href={project.href}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-flex rounded-full border border-ink/20 bg-white px-4 py-2 text-xs font-semibold text-ink transition hover:-translate-y-0.5 hover:border-ink/45"
                  >
                    {project.ctaLabel ?? "View Project"}
                  </a>
                </div>
              </article>
            </ParallaxCard>
          </RevealBlock>
        ))}
      </section>
    </main>
  );
}

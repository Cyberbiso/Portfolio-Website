"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/agent", label: "Agent" },
] as const;

function isActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname.startsWith(href);
}

export function SiteNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    let previousY = window.scrollY;

    const onScroll = () => {
      const currentY = window.scrollY;
      const delta = currentY - previousY;

      if (currentY <= 32) {
        setIsVisible(true);
        previousY = currentY;
        return;
      }

      if (Math.abs(delta) < 8) {
        return;
      }

      if (delta > 0) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      previousY = currentY;
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const shouldShow = isVisible || isOpen;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-30 px-4 pt-4 transition-transform duration-300 md:px-8 ${
        shouldShow ? "translate-y-0" : "-translate-y-[120%]"
      }`}
    >
      <nav className="mx-auto w-full max-w-7xl rounded-2xl border border-white/30 bg-white/70 px-4 py-3 shadow-lg backdrop-blur-xl">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="text-sm font-bold uppercase tracking-[0.14em] text-ink"
          >
            Thabiso
          </Link>

          <div className="hidden flex-wrap items-center gap-2 md:flex">
            {navLinks.map((link) => {
              const active = isActive(pathname, link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                    active ? "bg-ink text-white" : "text-ink/85 hover:bg-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <button
            type="button"
            aria-label="Toggle navigation menu"
            aria-expanded={isOpen}
            aria-controls="mobile-nav-links"
            onClick={() => {
              setIsOpen((previous) => !previous);
            }}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink/20 bg-white/75 text-ink md:hidden"
          >
            <span className="text-xl leading-none">{isOpen ? "x" : "+"}</span>
          </button>
        </div>

        <div
          id="mobile-nav-links"
          className={`grid gap-2 overflow-hidden transition-all duration-300 md:hidden ${
            isOpen ? "mt-3 max-h-64 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          {navLinks.map((link) => {
            const active = isActive(pathname, link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => {
                  setIsOpen(false);
                }}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  active
                    ? "bg-ink text-white"
                    : "bg-white/70 text-ink hover:bg-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}

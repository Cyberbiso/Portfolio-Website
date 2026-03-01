"use client";

import { trackEvent } from "@/lib/analytics";

interface CvDownloadButtonProps {
  label: string;
  href: string;
}

export function CvDownloadButton({ label, href }: CvDownloadButtonProps) {
  return (
    <a
      href={href}
      download
      onClick={() => {
        void trackEvent("cv_download_click", { source: "landing" });
      }}
      className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#0b1a2e] transition hover:-translate-y-0.5 hover:bg-[#e8eef8]"
    >
      {label}
    </a>
  );
}

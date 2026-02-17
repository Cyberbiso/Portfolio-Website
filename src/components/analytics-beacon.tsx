"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

export function AnalyticsBeacon(): null {
  useEffect(() => {
    void trackEvent("page_view", { source: "landing" });
  }, []);

  return null;
}

import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "var(--ink)",
        slate: "var(--slate)",
        steel: "var(--steel)",
        cloud: "var(--cloud)",
        accent: "var(--accent)",
        accentSoft: "var(--accent-soft)",
        mint: "var(--mint)"
      },
      boxShadow: {
        panel: "0 18px 55px rgba(21, 38, 63, 0.12)"
      },
      keyframes: {
        rise: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        }
      },
      animation: {
        rise: "rise 0.5s ease-out forwards"
      }
    }
  },
  plugins: []
};

export default config;

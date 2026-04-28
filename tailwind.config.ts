import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        karma: {
          green: "#16a34a",
          "green-light": "#22c55e",
          "green-dark": "#15803d",
          amber: "#f59e0b",
          "amber-light": "#fbbf24",
          "amber-dark": "#d97706",
        },
      },
      fontFamily: {
        sans: ["Outfit", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "Outfit", "system-ui", "sans-serif"],
        mono: ["Geist Mono", "monospace"],
      },
    },
  },
  // Safelist dynamic color classes used in landing page
  safelist: [
    "bg-emerald-100", "text-emerald-600",
    "bg-sky-100", "text-sky-600",
    "bg-amber-100", "text-amber-600",
  ],
  plugins: [],
};
export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0a",
        foreground: "#ededed",
        detective: {
          dark: "#1a1a1a",
          charcoal: "#2a2a2a",
          grey: "#3a3a3a",
          amber: "#d4af37",
          "amber-light": "#f0c674",
          red: "#cc6666",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)"],
        mono: ["var(--font-courier)"],
      },
    },
  },
  plugins: [],
};
export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ["var(--serif)", "Georgia", "serif"],
        sans: ["var(--sans)", "Helvetica Neue", "sans-serif"],
        mono: ["var(--mono)", "SF Mono", "monospace"],
      },
      colors: {
        "shelf-bg": "#fafaf9",
        "shelf-card": "#ffffff",
        "shelf-border": "#f1f0ee",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out forwards",
      },
    },
  },
  plugins: [],
};
export default config;

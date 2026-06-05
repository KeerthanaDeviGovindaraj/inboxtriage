import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-ibm-plex-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-ibm-plex-mono)", "monospace"],
      },
      colors: {
        surface: {
          DEFAULT: "#ffffff",
          dim: "#f7f5f0",
          page: "#f0ede6",
        },
        border: {
          DEFAULT: "#dddad3",
          strong: "#b5b2aa",
        },
        urgent: {
          DEFAULT: "#d94f4f",
          bg: "#fce8e8",
          border: "#f0b0b0",
        },
        medium: {
          DEFAULT: "#8a5c00",
          bg: "#fef3e2",
          border: "#f0d080",
        },
        low: {
          DEFAULT: "#2e6e30",
          bg: "#e8f5e9",
          border: "#a8d8a8",
        },
      },
      animation: {
        sweep: "sweep 1s ease-in-out infinite",
        "fade-up": "fadeUp 0.18s ease forwards",
        blink: "blink 1.1s step-end infinite",
      },
      keyframes: {
        sweep: {
          "0%": { transform: "translateX(-200%)" },
          "100%": { transform: "translateX(500%)" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(5px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

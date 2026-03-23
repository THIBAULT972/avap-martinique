import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sora: ["var(--font-sora)", "system-ui", "sans-serif"],
        outfit: ["var(--font-outfit)", "system-ui", "sans-serif"],
      },
      colors: {
        avap: {
          orange: "#f97316",
          "orange-dark": "#ea580c",
          "orange-light": "#fb923c",
          "orange-vivid": "#ff6b1a",
        },
      },
      animation: {
        "timer-pulse": "timer-pulse 0.8s ease-in-out infinite",
        "streak-glow": "streak-glow 2s ease-in-out infinite",
      },
      keyframes: {
        "timer-pulse": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.08)" },
        },
        "streak-glow": {
          "0%, 100%": { boxShadow: "0 0 15px rgba(251, 191, 36, 0.2)" },
          "50%": { boxShadow: "0 0 30px rgba(251, 191, 36, 0.5)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

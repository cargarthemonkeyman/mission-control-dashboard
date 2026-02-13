import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        mission: {
          bg: "#0f172a",
          surface: "#1e293b",
          border: "#334155",
          accent: "#06b6d4",
          success: "#10b981",
          warning: "#f59e0b",
          danger: "#ef4444",
          text: "#f1f5f9",
          muted: "#94a3b8"
        }
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.3s ease-in-out"
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        }
      }
    },
  },
  plugins: [],
};

export default config;
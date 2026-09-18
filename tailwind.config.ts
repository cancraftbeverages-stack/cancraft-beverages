import type { Config } from "tailwindcss";

/**
 * Design tokens per ARCHITECTURE.md Section 5.
 * Colour, type, spacing and motion values are centralized here —
 * components must reference tokens, not raw hex/px values.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./content/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0B0B0A",
          900: "#171716",
          800: "#242321",
          700: "#2A2927",
        },
        paper: {
          50: "#F4F1EB",
          100: "#EFEAE0",
        },
        steel: {
          300: "#B8B4AC",
          400: "#9C978C",
          600: "#6B675E",
        },
        accent: {
          100: "#F3DCC7",
          500: "#C9601E",
          600: "#A84E17",
        },
        champagne: {
          500: "#C9A46A",
        },
        success: "#3E7A4B",
        error: "#B3402C",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      maxWidth: {
        content: "1280px",
      },
      borderRadius: {
        sm: "6px",
        DEFAULT: "8px",
        lg: "10px",
      },
      transitionTimingFunction: {
        confident: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      transitionDuration: {
        micro: "150ms",
        standard: "300ms",
        reveal: "500ms",
      },
      letterSpacing: {
        eyebrow: "0.14em",
      },
    },
  },
  plugins: [],
};

export default config;

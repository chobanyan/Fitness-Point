import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#eef1f8",
          100: "#d6ddef",
          200: "#adbadf",
          300: "#7d90c9",
          400: "#4f66ac",
          500: "#2e4790",
          600: "#1f3374",
          700: "#16255a",
          800: "#101b42",
          900: "#0b1330",
        },
        accent: {
          50: "#fff4ec",
          100: "#ffe3cc",
          200: "#ffc699",
          300: "#ffa15c",
          400: "#fb8228",
          500: "#ec6608",
          600: "#c85404",
          700: "#9c4106",
          800: "#7a350c",
          900: "#652d0e",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        body: ["var(--font-plex-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-plex-mono)", "ui-monospace", "monospace"],
      },
      colors: {
        paper: {
          DEFAULT: "#faf7f0",
          dark: "#141210",
        },
        ink: {
          DEFAULT: "#211d17",
          dark: "#f3ede0",
        },
        quality: {
          50: "#eef1fb",
          200: "#b9c4ee",
          500: "#3d54b0",
          600: "#33468f",
          700: "#2a3a76",
        },
        ethics: {
          50: "#ecf5f0",
          200: "#a9d6bf",
          500: "#2d7a56",
          600: "#256546",
          700: "#1e5138",
        },
        transparency: {
          50: "#fbf1e2",
          200: "#f0cb8a",
          500: "#c9862a",
          600: "#a86e21",
          700: "#87581a",
        },
      },
      boxShadow: {
        card: "0 1px 2px rgba(33,29,23,0.06), 0 8px 24px -12px rgba(33,29,23,0.18)",
      },
    },
  },
  plugins: [],
};
export default config;

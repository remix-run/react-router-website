/**
 * Site Design: https://www.figma.com/file/FIf4Len6Cgl8rzU8gshJ5s/Design-System?node-id=0%3A1
 * Logos: https://www.figma.com/file/FWIGxAs7I9m54YoBHnBU1h/Logo-Design?node-id=61%3A510
 * Color scheme: https://tailwind.ink?p=7.f9faf9f0f1f1dddfe1b7bcbe8894936a726d54575040413c2c2b2a121212fdfcfbfcf0edf9ccdbf09eb7ee6e90f44250d03150aa253a7d1a264d1014faf9f0f8ef9ffecc1bd3be33a69719837a0b686207514a07373307271f06f2f6f1e0f0deb6e7b56bd96833ad4e22942c1e7e1f1b611b1443170f2913ecf4f3c9eff03defe954cfb71db28b14996313844c13663e0f46300b2c25f5f9fbdff0fcbcdcf98ebbf03992ff4d71da3f55c93240a7232b7a141b4efcfbfbf9eef5f4caece79fd7e571bed83bd2c1338b9a2769701c45441325
 *
 */
import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

export default {
  content: ["./app/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    screens: {
      "2xs": "320px",
      xs: "480px",
      ...defaultTheme.screens,
    },
    fontFamily: {
      display: ["Inter", ...defaultTheme.fontFamily.sans],
      sans: ["Inter", ...defaultTheme.fontFamily.sans],
      mono: ["Source Code Pro", ...defaultTheme.fontFamily.mono],
    },
    fontSize: {
      xs: ["0.75rem", { lineHeight: "1.333" }], // 12px
      sm: ["0.875rem", { lineHeight: "1.425" }], // 14px
      base: ["1rem", { lineHeight: "1.5" }], // 16px
      lg: ["1.125rem", { lineHeight: "1.556" }], // 18px
      xl: ["1.25rem", { lineHeight: "1.556" }], // 20px
      "2xl": ["1.5rem", { lineHeight: "1.333" }], // 24px
      "3xl": ["1.875rem", { lineHeight: "1.2" }], // 30px
      "4xl": ["2.25rem", { lineHeight: "1.111" }], // 36px
      "5xl": ["3rem", { lineHeight: "1.083" }], // 48px
      "6xl": ["4rem", { lineHeight: "1.0625" }], // 64px
      "7xl": ["4.5rem", { lineHeight: "1.05" }], // 72px
      "8xl": ["6rem", { lineHeight: "1.125" }], // 96px
      "9xl": ["8rem", { lineHeight: "1.125" }], // 128px
    },
    container({ theme }) {
      return {
        center: true,
        padding: {
          DEFAULT: theme("spacing.6", "1.5rem"),
          sm: theme("spacing.6", "1.5rem"),
          md: theme("spacing.8", "2rem"),
          lg: theme("spacing.10", "2.5rem"),
        },
      };
    },
    extend: {
      colors: {
        current: "currentColor",
        transparent: "transparent",
        inherit: "inherit",
        white: "#fff",
        black: "#000",
        gray: {
          50: "#f7f7f7",
          100: "#e3e3e3",
          200: "#c8c8c8",
          300: "#a4a4a4",
          400: "#818181",
          500: "#666666",
          600: "#515151",
          700: "#434343",
          800: "#383838",
          900: "#121212",
        },
        red: {
          50: "#fef2f3",
          100: "#ffe1e3",
          200: "#ffc9cd",
          300: "#fea3aa",
          400: "#fc6d78",
          500: "#f44250",
          brand: "#f44250", // hard-coded in embedded SVG for <docs-*> elements
          600: "#e12130",
          700: "#bd1825",
          800: "#9d1722",
          900: "#821a22",
        },
        yellow: {
          50: "#fffce8",
          100: "#fff9c2",
          200: "#fff087",
          300: "#ffde44",
          400: "#fecc1b",
          brand: "#fecc1b", // hard-coded in embedded SVG for <docs-*> elements
          500: "#eeb004",
          600: "#cd8701", // hard-coded in embedded SVG for <docs-*> elements
          700: "#a45f04",
          800: "#874b0c",
          900: "#733d10",
        },
        green: {
          50: "#f2fcf1",
          100: "#dffade",
          200: "#c1f3bf",
          300: "#90e88d",
          400: "#6bd968",
          brand: "#6bd968",
          500: "#30ba2d",
          600: "#229920",
          700: "#1d791c",
          800: "#1c601b",
          900: "#184f18",
        },
        aqua: {
          50: "#effefc",
          100: "#cafdf8",
          200: "#94fbf4",
          300: "#3defe9",
          brand: "#3defe9",
          400: "#24dddc",
          500: "#0cbdc0",
          600: "#06969b",
          700: "#0a767b",
          800: "#0d5e62",
          900: "#104d51",
        },
        blue: {
          50: "#eef7ff",
          100: "#d9edff",
          200: "#bce0ff",
          300: "#8ecdff",
          400: "#59b0ff",
          500: "#3992ff",
          brand: "#3992ff", // hard-coded in embedded SVG for <docs-*> elements
          600: "#1b6ef5",
          700: "#1458e1",
          800: "#1747b6",
          900: "#193f8f",
        },
        pink: {
          50: "#fff4ff",
          100: "#fde8ff",
          200: "#fbd1fd",
          300: "#faadfa",
          400: "#f77bf6",
          500: "#ec49e9",
          600: "#d83bd2",
          brand: "#d83bd2",
          700: "#ac1fa3",
          800: "#8d1b85",
          900: "#731c6b",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;

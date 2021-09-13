const defaultTheme = require("tailwindcss/defaultTheme");
const colors = require("./app/utils/colors");

module.exports = {
  mode: "jit",
  purge: ["./app/**/*.{ts,tsx}"],
  darkMode: "media", // or 'media' or 'class'
  theme: {
    colors: {
      transparent: "transparent",
      current: "currentColor",
      ...colors,
    },
    fontFamily: {
      display: ['"Founders Grotesk"', ...defaultTheme.fontFamily.sans],
    },
    fontSize: {
      xs: ".75rem",
      sm: ".875rem",
      base: "1rem", // h6 small / h6 large
      lg: "1.125rem", // h5 small / h5 large
      xl: "1.25rem", // h4 small
      "2xl": "1.5rem", // h3 small / h4 large
      "3xl": "1.625rem", // h2 small
      "4xl": "1.75rem", // h3 large
      "5xl": "2rem", // h1 small
      "6xl": "2.5rem", // title small
      "7xl": "2.75rem", // h2 large
      "8xl": "4rem", // h1 large
      "9xl": "4.5rem", // title large
    },
    container: {
      center: true,
      padding: {
        DEFAULT: "1.5rem",
        sm: "1.5rem",
        md: "1.5rem",
        lg: "2rem",
        xl: "2.5rem",
        "2xl": "2.5rem",
      },
    },
    extend: {
      fontFamily: {
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
      },
      lineHeight: {
        negative: "0.88",
        squeezed: "1.125",
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            maxWidth: null,
            color: theme("colors.black"),
          },
        },
        dark: {
          css: {
            color: theme("colors.white"),
            "h1, h2, h3, h4, h5, h6": {
              color: theme("colors.white"),
            },
          },
        },
      }),
    },
  },
  variants: {
    extend: {
      ringWidth: ["focus-visible"],
      ringColor: ["focus-visible"],
      ringOffsetWidth: ["focus-visible"],
      ringOffsetColor: ["focus-visible"],
    },
  },
};

const defaultTheme = require("tailwindcss/defaultTheme");
const resolveConfig = require("tailwindcss/resolveConfig");
const colors = require("./colors");

/**
 * @type {import("tailwindcss/tailwind-config").TailwindConfig['theme']}
 */
const theme = {
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
  screens: {
    xs: "480px",
    ...defaultTheme.screens,
    "xs-only": { max: `${parseInt(defaultTheme.screens.sm, 10) - 1}px` },
    "sm-down": { max: `${parseInt(defaultTheme.screens.md, 10) - 1}px` },
    "md-down": { max: `${parseInt(defaultTheme.screens.lg, 10) - 1}px` },
    "lg-down": { max: `${parseInt(defaultTheme.screens.xl, 10) - 1}px` },
    "xl-down": { max: `${parseInt(defaultTheme.screens["2xl"], 10) - 1}px` },
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
    padding: {
      "0-5": "0.125rem /* 2px */",
    },
    margin: {
      "0-5": "0.125rem /* 2px */",
    },
    fontFamily: {
      sans: ["Inter", ...defaultTheme.fontFamily.sans],
    },
    lineHeight: {
      negative: "0.88",
      squeezed: "1.125",
    },
    transitionProperty: {
      height: "height",
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
};

const tailwindConfig = resolveConfig({ theme });

exports.theme = theme;
exports.tailwindConfig = tailwindConfig;

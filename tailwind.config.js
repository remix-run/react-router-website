const plugin = require("tailwindcss/plugin");
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
      screens: {
        xs: "480px",
      },
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
  plugins: [
    require("@tailwindcss/aspect-ratio"),
    // TODO: Get rid of all this when comfortable with `flex: gap`
    flexGap(),
  ],
};

function flexGap() {
  return ({ addComponents, e, theme, variants }) => {
    let gapTheme = theme("gap");
    let gapVariants = variants("gap");

    addComponents({
      [`.${e(`flex-gap-wrapper`)}`]: {
        display: "flow-root",
      },
      [`.${e(`flex-gap-wrapper`)}::before, .${e(`flex-gap-wrapper`)}::after`]: {
        content: "''",
        display: "table",
      },
      [`.${e(`flex-gap`)}, .${e(`flex-gap-padding`)}`]: {
        "--gap-x": "0px",
        "--gap-y": "0px",
        "--gap-x-half": "calc(var(--gap-x) / 2)",
        "--gap-x-half-negative": "calc(var(--gap-x-half) * -1)",
        "--gap-y-half": "calc(var(--gap-y) / 2)",
        "--gap-y-half-negative": "calc(var(--gap-y-half) * -1)",
        margin: "var(--gap-y-half-negative) var(--gap-x-half-negative)",
      },
      [`.${e(`flex-gap`)} > *`]: {
        margin: "var(--gap-y-half) var(--gap-x-half)",
      },
      [`.${e(`flex-gap-padding`)} > *`]: {
        padding: "var(--gap-y-half) var(--gap-x-half)",
      },
    });

    let splitGapUtilities = {};
    let combinedGapUtilities = {};
    for (let [modifier, value] of Object.entries(gapTheme)) {
      combinedGapUtilities = {
        ...combinedGapUtilities,
        [`.${e(`flex-gap-${modifier}`)}`]: {
          "--gap-x": String(value) === "0" ? "0px" : value,
          "--gap-y": String(value) === "0" ? "0px" : value,
        },
      };

      splitGapUtilities = {
        ...splitGapUtilities,
        [`.${e(`flex-gap-x-${modifier}`)}`]: {
          "--gap-x": String(value) === "0" ? "0px" : value,
        },
        [`.${e(`flex-gap-y-${modifier}`)}`]: {
          "--gap-y": String(value) === "0" ? "0px" : value,
        },
      };
    }

    let gapUtilities = {
      ...combinedGapUtilities,
      ...splitGapUtilities,
    };

    addComponents(gapUtilities, gapVariants);
  };
}

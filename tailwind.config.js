const theme = require("./app/utils/tailwind").theme;

module.exports = {
  mode: "jit",
  purge: ["./app/**/*.{ts,tsx}"],
  darkMode: "media", // or 'media' or 'class'
  theme,
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

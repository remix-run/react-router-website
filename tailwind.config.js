const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  mode: "jit",
  purge: ["./app/**/*.{ts,tsx}"],
  darkMode: "media", // or 'media' or 'class'
  theme: {
    colors: {
      transparent: "transparent",
      current: "currentColor",
      black: "#121212",
      white: "#ffffff",
      gray: {
        DEFAULT: "#5f5f5f",
        50: "#d2d2d2",
        100: "#c5c5c5",
        200: "#ababab",
        300: "#929292",
        400: "#797979",
        500: "#5f5f5f",
        600: "#4b4b4b",
        650: "#464646",
        700: "#363636",
        800: "#222222",
        900: "#0d0d0d",
      },
      get neutral() {
        return this.gray;
      },
      red: {
        DEFAULT: "#f44250",
        50: "#fddadd",
        100: "#fcc9cd",
        200: "#faa7ae",
        300: "#f8858e",
        400: "#f6646f",
        500: "#f44250",
        600: "#f11728",
        700: "#ce0c1b",
        800: "#a30916",
        900: "#770710",
      },
      orange: {
        DEFAULT: "#f57b4e",
        50: "#feece6",
        100: "#fde0d5",
        200: "#fbc7b3",
        300: "#f9ad92",
        400: "#f79470",
        500: "#f57b4e",
        600: "#f35e27",
        700: "#e4470d",
        800: "#be3b0b",
        900: "#972f09",
      },
      yellow: {
        DEFAULT: "#fecc1b",
        50: "#fff0bb",
        100: "#ffeca9",
        200: "#fee486",
        300: "#fedc62",
        400: "#fed43f",
        500: "#fecc1b",
        600: "#efbb01",
        700: "#c79b01",
        800: "#9e7b01",
        900: "#755c01",
      },
      get amber() {
        return this.yellow;
      },
      green: {
        DEFAULT: "#68d968",
        50: "#d6f5d6",
        100: "#caf2ca",
        200: "#b1ebb1",
        300: "#99e599",
        400: "#80df80",
        500: "#68d968",
        600: "#47d147",
        700: "#30bf30",
        800: "#289f28",
        900: "#207e20",
      },
      get emerald() {
        return this.green;
      },
      cyan: {
        DEFAULT: "#3defe9",
        50: "#d1fbfa",
        100: "#c1faf8",
        200: "#a0f7f4",
        300: "#7ff4f0",
        400: "#5ef2ed",
        500: "#3defe9",
        600: "#17ece5",
        700: "#11cac4",
        800: "#0ea49f",
        900: "#0a7e7a",
      },
      get sky() {
        return this.cyan;
      },
      blue: {
        DEFAULT: "#3992ff",
        50: "#c3deff",
        100: "#b3d5ff",
        200: "#95c5ff",
        300: "#76b4ff",
        400: "#58a3ff",
        500: "#3992ff",
        600: "#0b79ff",
        700: "#0063dc",
        800: "#004eae",
        900: "#003a80",
      },
      get indigo() {
        return this.blue;
      },
      violet: {
        DEFAULT: "#d83bd2",
        50: "#f3c1f1",
        100: "#f0b2ed",
        200: "#ea94e7",
        300: "#e477e0",
        400: "#de59d9",
        500: "#d83bd2",
        600: "#c327bd",
        700: "#a1209c",
        800: "#7f197b",
        900: "#5d135a",
      },
      get purple() {
        return this.violet;
      },
      get fuchsia() {
        return this.violet;
      },
      pink: {
        DEFAULT: "#ea94e7",
        50: "#f5cef4",
        100: "#f4c7f2",
        200: "#f2baf0",
        300: "#efaeed",
        400: "#eda1ea",
        500: "#ea94e7",
        600: "#e26ede",
        700: "#db47d6",
        800: "#cc28c6",
        900: "#a621a1",
      },
      get rose() {
        return this.pink;
      },
    },
    fontFamily: {
      display: ['"Founders Grotesk"', ...defaultTheme.fontFamily.sans],
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
      typography: (theme) => ({
        DEFAULT: {
          css: {
            maxWidth: null,
            color: theme("colors.black"),
            "h1, h2, h3, h4, h5, h6": {
              fontFamily: theme("fontFamily.display").join(),
              color: theme("colors.black"),
            },
            "a, a code, code, strong": {
              color: "inherit",
            },
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
  plugins: [require("@tailwindcss/typography")],
};

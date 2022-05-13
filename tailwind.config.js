/**
 * Site Design: https://www.figma.com/file/F2R0MwJxgQcJnjpQ7q3DU8/Core-Site-Design?node-id=29%3A6
 * Logos: https://www.figma.com/file/FWIGxAs7I9m54YoBHnBU1h/Logo-Design?node-id=61%3A510
 * Color scheme: https://tailwind.ink?p=7.f9faf9f0f1f1dddfe1b7bcbe8894936a726d54575040413c2c2b2a121212fdfcfbfcf0edf9ccdbf09eb7ee6e90f44250d03150aa253a7d1a264d1014faf9f0f8ef9ffecc1bd3be33a69719837a0b686207514a07373307271f06f2f6f1e0f0deb6e7b56bd96833ad4e22942c1e7e1f1b611b1443170f2913ecf4f3c9eff03defe954cfb71db28b14996313844c13663e0f46300b2c25f5f9fbdff0fcbcdcf98ebbf03992ff4d71da3f55c93240a7232b7a141b4efcfbfbf9eef5f4caece79fd7e571bed83bd2c1338b9a2769701c45441325
 *
 */
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}"],
  theme: {
    fontSize: {
      ...defaultTheme.fontSize,

      // names come from the figma file
      // desktop paragraph small -> d-p-s
      "d-p-sm": ["16px", "24px"],
      "d-p-lg": ["20px", "32px"],
      "d-h3": ["20px", "32px"],
      "d-h2": ["30px", "30px"],
      "d-h1": ["45px", "45px"],

      // mobile paragraph small -> d-m-s
      "m-p-sm": ["14px", "24px"],
      "m-p-lg": ["18px", "32px"],
      "m-h3": ["20px", "24px"],
      "m-h2": ["24px", "32px"],
      "m-h1": ["32px", "32px"],
      "m-j": ["40px", "48px"],

      eyebrow: ["16px", "24px"],
    },
    container: {
      center: true,
      padding: {
        DEFAULT: "24px",
        sm: "24px",
        md: "32px",
        lg: "40px",
      },
    },
    extend: {
      colors: {
        current: "currentColor",
        gray: {
          50: "#f8fbfc",
          100: "#eef2f8",
          200: "#dde2e8",
          300: "#b7bcbe",
          400: "#828282",
          500: "#6a726d",
          600: "#3f3f3f",
          700: "#292929",
          800: "#1e1e1e",
          900: "#121212",
        },
        red: {
          50: "#fdfcfb",
          100: "#fcf0ed",
          200: "#f9ccdb",
          300: "#f09eb7",
          400: "#ee6e90",
          500: "#f44250",
          brand: "#f44250",
          600: "#d03150",
          700: "#aa253a",
          800: "#7d1a26",
          900: "#4d1014",
        },
        yellow: {
          50: "#faf9f0",
          100: "#f8ef9f",
          200: "#fecc1b",
          brand: "#fecc1b",
          300: "#d3be33",
          400: "#a69719",
          500: "#837a0b",
          600: "#686207",
          700: "#514a07",
          800: "#373307",
          900: "#271f06",
        },
        green: {
          50: "#f2f6f1",
          100: "#e0f0de",
          200: "#b6e7b5",
          300: "#6bd968",
          brand: "#6bd968",
          400: "#33ad4e",
          500: "#22942c",
          600: "#1e7e1f",
          700: "#1b611b",
          800: "#144317",
          900: "#0f2913",
        },
        aqua: {
          50: "#ecf4f3",
          100: "#c9eff0",
          200: "#3defe9",
          brand: "#3defe9",
          300: "#54cfb7",
          400: "#1db28b",
          500: "#149963",
          600: "#13844c",
          700: "#13663e",
          800: "#0f4630",
          900: "#0b2c25",
        },
        blue: {
          50: "#DAEEFF",
          100: "#AAD6FF",
          200: "#7FBFFF",
          300: "#59A8FF",
          400: "#3992ff",
          brand: "#3992ff",
          500: "#287BD9",
          600: "#1A65B3",
          700: "#0F4F8C",
          800: "#073966",
          900: "#022340",
        },
        pink: {
          50: "#fcfbfb",
          100: "#f9eef5",
          200: "#f4caec",
          300: "#e79fd7",
          400: "#e571be",
          500: "#d83bd2",
          brand: "#d83bd2",
          600: "#c1338b",
          700: "#9a2769",
          800: "#701c45",
          900: "#441325",
        },
      },
    },
  },
};

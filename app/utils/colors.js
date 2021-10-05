/**
 * @type {{ [key in Color]: ColorDef | string }}
 */
const colors = {
  black: "#121212",
  white: "#ffffff",
  gray: {
    DEFAULT: "#898989",
    "050": "#f3f3f3",
    100: "#e7e7e7",
    150: "#dbdbdb",
    200: "#d0d0d0",
    250: "#c4c4c4",
    300: "#b8b8b8",
    350: "#acacac",
    400: "#a0a0a0",
    450: "#949494",
    500: "#898989",
    550: "#7d7d7d",
    600: "#717171",
    650: "#656565",
    700: "#595959",
    750: "#4d4d4d",
    800: "#414141",
    850: "#363636",
    900: "#2a2a2a",
    950: "#1e1e1e",
  },
  get neutral() {
    return this.gray;
  },
  red: {
    DEFAULT: "#f44250",
    "050": "#fddadd",
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
    "050": "#feece6",
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
    "050": "#fff0bb",
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
  amber: {
    DEFAULT: "#d19a66",
    "050": "#f1e0d0",
    100: "#edd8c4",
    200: "#e6c9ad",
    300: "#dfb995",
    400: "#d8aa7e",
    500: "#d19a66",
    600: "#c68343",
    700: "#a96c33",
    800: "#855528",
    900: "#623f1d",
  },
  green: {
    DEFAULT: "#68d968",
    "050": "#d6f5d6",
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
    "050": "#d1fbfa",
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
    "050": "#c3deff",
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
    "050": "#f3c1f1",
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
    "050": "#f5cef4",
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
};

module.exports = colors;

/**
 * @exports @typedef {Readonly<{ DEFAULT: string; [key: number]: string }>} ColorDef
 */

/**
 * @exports @typedef {'black' | 'white' | 'gray' | 'neutral' | 'red' | 'orange' |
 * 'yellow' | 'amber' | 'green' | 'emerald' | 'cyan' | 'sky' | 'fuchsia' |
 * 'rose' | 'pink' | 'violet' | 'purple' | 'indigo' | 'blue'} Color
 */

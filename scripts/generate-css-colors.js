const path = require("path");
const colors = require("./colors");
const { writeFile } = require("fs/promises");

main();

async function main() {
  try {
    await writeFile(path.resolve(__dirname, "../styles/colors.css"), getCss(), {
      encoding: "utf8",
    });
    console.log("\x1b[32m", "✅ CSS file `colors.css` successfully written!");
  } catch (err) {
    console.error("🙅‍♀️ There was an error writing the CSS file.");
    console.log("\n  ----------------------------------------------\n\n");
    console.error(err);
  }
}

function getCss() {
  let css = "/* THIS FILE IS GENERATED. DO NOT EDIT DIRECTLY! */\n";
  css += "/* @see app/utils/colors.js */\n";
  css += ":root {";
  for (let [color, definitions] of Object.entries(colors)) {
    if (typeof definitions === "string") {
      css += `\n  --color-${color}: ${definitions};`;
    } else {
      for (let [variant, value] of Object.entries(definitions).sort(
        sortColorEntries
      )) {
        if (variant === "DEFAULT") {
          css += `\n  --color-${color}: ${value};`;
        } else {
          css += `\n  --color-${color}-${variant}: ${value};`;
        }
      }
    }
  }
  return css + "\n}\n";
}

function sortColorEntries([a], [b]) {
  if (a === "DEFAULT") return 1;
  if (b === "DEFAULT") return -1;
  return a > b ? 1 : a < b ? -1 : 0;
}

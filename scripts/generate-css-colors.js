const colors = require("../app/utils/colors");
const path = require("path");
const fs = require("fs");

let css = "/* THIS FILE IS GENERATED. DO NOT EDIT DIRECTLY! */\n";
css += "/* @see app/utils/colors.js */\n";
css += ":root {";
for (let color in colors) {
  if (typeof colors[color] === "string") {
    css += `\n  --color-${color}: ${colors[color]};`;
  } else {
    for (let variant in colors[color]) {
      if (variant === "DEFAULT") {
        css += `\n  --color-${color}: ${colors[color][variant]};`;
      } else {
        css += `\n  --color-${color}-${variant}: ${colors[color][variant]};`;
      }
    }
  }
}
css += "\n}\n";

try {
  fs.writeFileSync(path.resolve(__dirname, "../styles/colors.css"), css, {
    encoding: "utf8",
  });
  console.log("\x1b[32m", "✅ CSS file `colors.css` successfully written!");
} catch (err) {
  console.error("🙅‍♀️ There was an error writing the CSS file.");
  console.log("\n  ----------------------------------------------\n\n");
  console.error(err);
}

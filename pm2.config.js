const dotenv = require("dotenv");

let result = dotenv.config();

if (result.error) {
  throw result.error;
}

module.exports = {
  apps: [
    {
      name: "Remix",
      script: "remix dev",
      ignore_watch: ["."],
      env: {
        ...result.parsed,
        NODE_ENV: "development",
      },
    },
    {
      name: "Tailwind",
      script:
        "tailwindcss --input ./styles/tailwind.css --output ./app/styles/tailwind.css --watch --postcss",
      ignore_watch: ["."],
    },
    {
      name: "Express",
      script: "node server/index.js",
      ignore_watch: ["."],
      env: {
        ...result.parsed,
        NODE_ENV: "development",
      },
    },
  ],
};

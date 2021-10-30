const dotenv = require("dotenv");

let result = dotenv.config();

if (result.error) {
  throw result.error;
}

module.exports = {
  apps: [
    {
      name: "Remix",
      script: "remix watch",
      ignore_watch: ["."],
      env: {
        ...result.parsed,
        NODE_ENV: "development",
      },
    },
    {
      name: "Tailwind",
      script: "npm run dev:css",
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

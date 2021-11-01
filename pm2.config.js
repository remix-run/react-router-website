const dotenv = require("dotenv");

let result = dotenv.config();

if (result.error) {
  throw result.error;
}

/**
 * @typedef {{ apps: import('pm2').StartOptions[] }} PM2Config
 */

/**
 * @type {PM2Config}
 */
module.exports = {
  apps: [
    {
      name: "Tailwind",
      script: "npm run dev:css",
      ignore_watch: ["."],
    },
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

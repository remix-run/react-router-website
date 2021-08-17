module.exports = {
  apps: [
    {
      name: "Remix",
      script: "remix dev",
      ignore_watch: ["."],
      env: {
        NODE_ENV: "development",
      },
    },
    {
      name: "Express",
      script: "node server/index.js",
      ignore_watch: ["."],
      env: {
        NODE_ENV: "development",
      },
    },
  ],
};

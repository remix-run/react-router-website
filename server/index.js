const path = require("path");
const express = require("express");
const { createRequestHandler } = require("@remix-run/express");

////////////////////////////////////////////////////////////////////////////////
let app = express();

app.disable("x-powered-by");

app.use(express.static("public", { immutable: true, maxAge: "1y" }));

app.all(
  "*",
  process.env.NODE_ENV === "production" ? prodHandler() : devHandler()
);

let port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Express server started on http://localhost:${port}`);
});

////////////////////////////////////////////////////////////////////////////////
function purgeAppRequireCache() {
  let cwd = process.cwd();
  for (let key in require.cache) {
    if (key.startsWith(path.join(cwd, "server/build"))) {
      delete require.cache[key];
    }
  }
}

function devHandler() {
  return (req, res, next) => {
    purgeAppRequireCache();
    return createRequestHandler({
      build: require("./build"),
      getLoadContext,
    })(req, res, next);
  };
}

function prodHandler() {
  return createRequestHandler({
    build: require("./build"),
    getLoadContext,
  });
}

// TODO: We only use `versions` here, should probably change the way we get this
// information to the loader since it's not really about load context anymore
function getLoadContext() {
  return {
    docs: {
      owner: "remix-run",
      repo: "react-router",
      remotePath: "docs",
      localPath: "../react-router/docs",
      localLangDir: "_i18n",
      versions: ">=6.0.0-beta.6",
    },
  };
}

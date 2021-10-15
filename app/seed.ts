import { saveDocs } from "./utils/save-docs";
import { installGlobals } from "@remix-run/node";
installGlobals();

async function seed() {
  await Promise.all([
    saveDocs("refs/tags/v6.0.0-beta.6", ""),
    saveDocs("refs/heads/main", ""),
  ]);
}

try {
  seed();
} catch (e) {
  throw e;
}

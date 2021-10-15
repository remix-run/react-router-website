import { saveDocs } from "./utils/save-docs";
import { installGlobals } from "@remix-run/node";
installGlobals();

async function seed() {
  await saveDocs("/refs/tags/v6.0.0-beta.5", "");
  await saveDocs("/refs/tags/v6.0.0-beta.6", "");
  await saveDocs("/refs/heads/dev", "");
}

try {
  seed();
} catch (e) {
  throw e;
}

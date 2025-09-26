import { getDoc, getMenu } from "./docs";
import { getBranches } from "./branches";
import { getTags } from "./tags";
import { fixupRefName } from "./doc-url-parser";

export type { Doc } from "./docs";

const REPO = process.env.SOURCE_REPO!;
if (!REPO) throw new Error("Missing process.env.SOURCE_REPO");

export function getRepoTags() {
  return getTags(REPO);
}

export function getRepoBranches() {
  return getBranches(REPO);
}

export function getRepoDocsMenu(ref: string) {
  return getMenu(REPO, fixupRefName(ref));
}

export function getRepoDoc(ref: string, slug: string) {
  return getDoc(REPO, fixupRefName(ref), slug);
}

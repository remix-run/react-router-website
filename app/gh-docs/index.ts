import { getDoc, getMenu } from "./docs";
import { getBranches } from "./branches";
import { getTags } from "./tags";

export { validateParams } from "./params";
export { getRepoTarballStream } from "./repo-tarball";

export type { MenuDoc, Doc } from "./docs";

const REPO = process.env.SOURCE_REPO!;
if (!REPO) throw new Error("Missing process.env.SOURCE_REPO");

export function getRepoTags() {
  return getTags(REPO);
}

export function getRepoBranches() {
  return getBranches(REPO);
}

export async function getLatestRepoTag() {
  let tags = await getTags(REPO);
  if (!tags) return null;
  return tags.slice(0, 1)[0];
}

export function getRepoDocsMenu(ref: string, lang: string) {
  return getMenu(REPO, ref, lang);
}

export function getRepoDoc(ref: string, slug: string) {
  return getDoc(REPO, ref, slug);
}

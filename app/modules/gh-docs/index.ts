import { getDoc, getMenu } from "./docs";
import { getBranches } from "./branches";
import { getLatestVersion, getTags } from "./tags";
import invariant from "tiny-invariant";

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

export async function getLatestRepoTag(): Promise<string> {
  let tags = await getTags(REPO);
  invariant(tags, "Expected tags in getLatestRepoTag");
  return getLatestVersion(tags);
}

export function getRepoDocsMenu(ref: string, lang: string) {
  return getMenu(REPO, fixupRefName(ref), lang);
}

export function getRepoDoc(ref: string, slug: string) {
  return getDoc(REPO, fixupRefName(ref), slug);
}

function fixupRefName(ref: string) {
  return ref === "dev" ||
    ref === "main" ||
    ref === "local" ||
    // when we switched to changesets the `v` went away, so we use that as a way
    // to know if we need to add hte `react-router@` prefix for interacting w/
    // github.
    ref.startsWith("v")
    ? ref
    : `react-router@${ref}`;
}

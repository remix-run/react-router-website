import { getDoc, getMenu } from "./docs";
import { getBranches } from "./branches";
import { getReferenceAPI } from "./reference-docs";
import { getLatestVersion, getTags } from "./tags";
import invariant from "tiny-invariant";
import semver from "semver";

export { getRepoTarballStream } from "./repo-tarball";

export type { Doc } from "./docs";

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

export async function getRepoDocsReferenceMenu(ref: string) {
  const api = await getReferenceAPI(REPO, ref);
  return api.getReferenceNav();
}

export function getRepoDoc(ref: string, slug: string) {
  return getDoc(REPO, fixupRefName(ref), slug);
}

export async function getRepoReferenceDoc(
  ref: string,
  pkgName: string,
  qualifiedName: string,
) {
  const api = await getReferenceAPI(REPO, ref);
  return api.getDoc(pkgName, qualifiedName);
}

export async function getPackageIndexDoc(ref: string, pkgName: string) {
  const api = await getReferenceAPI(REPO, ref);
  return api.getPackageIndexDoc(pkgName);
}

function fixupRefName(ref: string) {
  if (["dev", "main", "release-next", "local"].includes(ref)) {
    return ref;
  }

  // pre changesets, tags were like v6.2.0, so add a "v" to the ref from the URL
  if (semver.lt(ref, "6.4.0")) {
    return `v${ref}`;
  }

  // add react-router@ because that's what the tags are called after changesets
  return `react-router@${ref}`;
}

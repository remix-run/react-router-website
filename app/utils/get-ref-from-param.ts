import * as semver from "semver";

function getRefFromParam(
  refParam: string,
  refs: string[],
  latestBranch: string
): string | null {
  if (refs.length === 0) {
    throw new Error("No refs found");
  }

  let sortedValueTags = refs
    .filter((ref) => semver.valid(ref))
    .sort(semver.rcompare);

  let latestTag = sortedValueTags.at(0);

  if (!latestTag) {
    throw new Error("No latest ref found");
  }

  if (refs.includes(refParam)) {
    let valid = semver.valid(refParam);
    return valid ? `refs/tags/v${valid}` : `refs/heads/${refParam}`;
  }

  let versionFromRef = semver.valid(semver.coerce(refParam));

  if (!versionFromRef) {
    throw new Error("No valid semver found");
  }

  let diff = semver.cmp(latestTag, ">=", versionFromRef)
    ? semver.diff(versionFromRef, latestTag)
    : null;

  if (
    `v${versionFromRef}` === latestTag ||
    diff === "minor" ||
    diff === "patch" ||
    diff === "prerelease" ||
    diff === null
  ) {
    return latestBranch;
  }

  let maxSatisfying = semver.maxSatisfying(refs, refParam);
  if (maxSatisfying) {
    return `refs/tags/${maxSatisfying}`;
  }

  return null;
}

export { getRefFromParam };

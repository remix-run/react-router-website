import * as semver from "semver";

function getRefFromParam(
  refParam: string,
  refs: string[],
  latestBranch: string
): string | null {
  if (refs.length === 0) {
    throw new Error("No refs found");
  }

  if (refs.includes(refParam)) {
    let validVersion = semver.valid(refParam);
    return validVersion
      ? `refs/tags/v${validVersion}`
      : `refs/heads/${refParam}`;
  }

  let sortedValidTags = refs
    .filter((ref) => semver.valid(ref))
    .sort(semver.rcompare);

  let latestTag = sortedValidTags.at(0);

  if (!latestTag) {
    throw new Error("No latest ref found");
  }

  if (semver.satisfies(latestTag, refParam)) {
    return latestBranch;
  }

  let maxSatisfying = semver.maxSatisfying(refs, refParam);

  if (maxSatisfying) {
    return `refs/tags/${maxSatisfying}`;
  }

  return null;
}

export { getRefFromParam };

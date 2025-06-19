import semver from "semver";

function isRefBranch(ref: string): boolean {
  return ["dev", "main", "release-next", "local"].includes(ref);
}

/**
 * Fixes up ref names to match the actual GitHub ref structure
 * - Branches (dev, main, release-next, local) are used as-is
 * - Pre-changeset versions (< 6.4.0) get "v" prefix
 * - Post-changeset versions get "react-router@" prefix
 */
export function fixupRefName(ref: string): string {
  if (isRefBranch(ref)) {
    return ref;
  }

  // pre changesets, tags were like v6.2.0, so add a "v" to the ref from the URL
  if (semver.lt(ref, "6.4.0")) {
    return `v${ref}`;
  }

  // add react-router@ because that's what the tags are called after changesets
  return `react-router@${ref}`;
}

/**
 * Generates the correct GitHub raw URL based on the ref type
 * - For main/dev/local: uses the ref directly
 * - For semantic versions: uses refs/tags/{version}
 */
function generateGitHubRawUrl(ref: string, filePath: string): string {
  let baseUrl = "https://raw.githubusercontent.com/remix-run/react-router";

  // For main, dev, local, or any non-semver ref, use directly
  if (isRefBranch(ref)) {
    return `${baseUrl}/${ref}/${filePath}`;
  }

  // For semantic versions, use refs/tags/ structure
  return `${baseUrl}/refs/tags/${fixupRefName(ref)}/${filePath}`;
}

export function parseDocUrl(url: URL, splat: string) {
  let hasMdExtension = url.pathname.endsWith(".md");
  let firstSegment = splat.split("/")[0];
  let refParam =
    firstSegment === "dev" ||
    firstSegment === "local" ||
    semver.valid(firstSegment)
      ? firstSegment
      : undefined;

  let ref = refParam || "main";

  let isHomePage =
    url.pathname.endsWith("/home") || url.pathname.endsWith("/home.md");
  let isChangelogPage =
    url.pathname.endsWith("/changelog") ||
    url.pathname.endsWith("/changelog.md");

  let slug: string;
  if (isChangelogPage) {
    slug = "CHANGELOG";
  } else if (isHomePage) {
    slug = "docs/index";
  } else {
    // Build the docs path, removing refParam if present
    let docsPath = refParam ? splat.replace(`${refParam}/`, "") : splat;
    slug = `docs/${docsPath}`;
  }

  let ghSlug: string;
  if (isChangelogPage || isHomePage) {
    ghSlug = `${slug}.md`;
  } else {
    // TODO: Figure out if we need this part
    ghSlug = hasMdExtension ? slug : `${slug}.md`;
  }

  let githubPath = generateGitHubRawUrl(ref, ghSlug);

  return {
    ref,
    slug,
    githubPath,
    shouldRedirect: hasMdExtension,
  };
}

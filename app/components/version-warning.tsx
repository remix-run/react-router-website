import { Link } from "@remix-run/react";
import { useHeaderData } from "./docs-header/use-header-data";

export function VersionWarning() {
  let { isLatest, branches, currentGitHubRef } = useHeaderData();
  if (isLatest) return null;

  // Don't want to show release-next in the menu, but we do want to show
  // the branch-warning
  let warning = [...branches, "release-next"].includes(currentGitHubRef)
    ? `Viewing docs for ${currentGitHubRef} branch, not the latest release`
    : `Viewing docs for an older release`;

  return (
    <div className="hidden text-center lg:block">
      <div className="animate-[bounce_500ms_2.5] bg-red-brand p-2 text-xs text-white">
        {warning}.{" "}
        <Link to="/en/main" className="underline">
          View latest
        </Link>
      </div>
    </div>
  );
}

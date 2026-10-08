import { Link } from "react-router";
import type { HeaderData } from "./docs-header/data.server";

export function VersionWarning({ header }: { header: HeaderData }) {
  let { isLatest, branches, currentGitHubRef } = header;
  if (isLatest) return null;

  let warning = branches.includes(currentGitHubRef)
    ? `Viewing docs for ${currentGitHubRef} branch, not the latest release`
    : `Viewing docs for an older release`;

  return (
    <div className="hidden text-center lg:block">
      <div className="animate-[bounce_500ms_2.5] bg-red-brand p-2 text-xs text-white">
        {warning}.{" "}
        <Link to="/home" className="underline">
          View latest
        </Link>
      </div>
    </div>
  );
}

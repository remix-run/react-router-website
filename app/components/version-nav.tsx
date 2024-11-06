import { Link } from "@remix-run/react";
import { VersionSelect } from "./version-select";
import { useHeaderData } from "./docs-header/use-header-data";

export function VersionNav() {
  let { hasAPIDocs, apiDocsRef } = useHeaderData();

  return (
    <div className="inline-block">
      {hasAPIDocs ? (
        <div className="flex items-center">
          <VersionSelect />
          <div className="mr-2 w-[1px] bg-gray-200 dark:bg-gray-600" />
          <Link
            to={`https://api.reactrouter.com/${apiDocsRef}/`}
            className="font-bold text-gray-500 hover:underline dark:text-gray-300"
          >
            API Reference
          </Link>
        </div>
      ) : (
        <VersionSelect />
      )}
    </div>
  );
}

import * as React from "react";
import { RouteComponent, useMatches } from "remix";

import { DataOutlet, useOutletContext } from "~/components/data-outlet";
import { createMenuMap } from "~/components/nav";
import type { MenuDir, VersionHead } from "~/utils.server";

interface Context {
  menu: MenuDir;
  versions: VersionHead[];
  version: VersionHead;
}

let VersionPage: RouteComponent = () => {
  let matches = useMatches();
  let data = useOutletContext<Context>();

  let menuMap = React.useMemo(() => createMenuMap(data.menu), [data.menu]);

  let is404 = matches.some((match: any) => match.data && match.data.notFound);
  if (is404) return <NotFound />;

  return <DataOutlet context={menuMap} />;
};

function NotFound() {
  return (
    <div data-docs-not-found className="container">
      <h1>Not Found</h1>
    </div>
  );
}

export default VersionPage;

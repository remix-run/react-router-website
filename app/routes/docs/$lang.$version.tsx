import { useMemo } from "react";
import type { LoaderFunction } from "remix";
import { useMatches, json, useLoaderData } from "remix";

import { DataOutlet } from "~/components/data-outlet";
import { getMenu, getVersions, MenuDir, VersionHead } from "~/utils.server";
import { addTrailingSlash } from "~/utils/with-trailing-slash";
import { time } from "~/utils/time";
import { createMenuMap, Menu } from "~/components/docs-menu";

interface DocsRouteData {
  menu: MenuDir;
  versions: VersionHead[];
  version: VersionHead;
}

export let loader: LoaderFunction = ({ context, request }) => {
  return addTrailingSlash(request)(async () => {
    try {
      let [versionsMS, versions] = await time(() => getVersions());
      let [latest] = versions;

      let [menuMS, menu] = await time(() => getMenu(context.docs, latest));

      let data: DocsRouteData = {
        menu,
        version: latest,
        versions,
      };

      return json(data, {
        headers: {
          "Server-Timing": `versions;dur=${versionsMS}, menu;dur=${menuMS}`,
        },
      });
    } catch (error: unknown) {
      console.error(error);
      return json({ notFound: true }, { status: 404 });
    }
  });
};

export default function DocsLayout() {
  let matches = useMatches();
  let { menu, version, versions } = useLoaderData();

  let menuMap = useMemo(() => createMenuMap(menu), [menu]);

  let is404 = matches.some((match: any) => match.data && match.data.notFound);
  if (is404) return <NotFound />;

  return (
    <div className="flex">
      <div className="sticky top-0 min-w-0 h-screen flex-shrink-0 overflow-auto">
        <Menu menu={menu} version={version} versions={versions} />
      </div>
      <div>
        <DataOutlet context={menuMap} />
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div>
      <h1>Not Found</h1>
    </div>
  );
}

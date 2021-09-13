import { useMemo, useRef } from "react";
import type { LoaderFunction } from "remix";
import { useMatches, json, useLoaderData } from "remix";

import { DataOutlet } from "~/components/data-outlet";
import { getMenu, getVersions, MenuDir, VersionHead } from "~/utils.server";
import { addTrailingSlash } from "~/utils/with-trailing-slash";
import { time } from "~/utils/time";
import { createMenuMap, Menu } from "~/components/docs-menu";
import markdownStyles from "~/styles/markdown.css";
import { useElementScrollRestoration } from "~/hooks/scroll-restoration";

interface DocsRouteData {
  menu: MenuDir;
  versions: VersionHead[];
  version: VersionHead;
}

export let loader: LoaderFunction = ({ context, request }) => {
  return addTrailingSlash(request)(async () => {
    try {
      let [versionsMS, allVersions] = await time(() => getVersions());
      let heads = allVersions.filter((v) => v.isLatest);
      let [latest] = heads;

      let [menuMS, menu] = await time(() => getMenu(context.docs, latest));

      let data: DocsRouteData = {
        menu,
        version: latest,
        versions: heads,
      };

      return json(data, {
        headers: {
          "Cache-Control": "max-age=60",
          "Server-Timing": `versions;dur=${versionsMS}, menu;dur=${menuMS}`,
        },
      });
    } catch (error: unknown) {
      console.error(error);
      return json({ notFound: true }, { status: 404 });
    }
  });
};

export function links() {
  return [{ rel: "stylesheet", href: markdownStyles }];
}

export default function DocsLayout() {
  let matches = useMatches();
  let { menu, version, versions } = useLoaderData();
  let scrollRef = useRef<HTMLDivElement>(null);
  useElementScrollRestoration(scrollRef);

  let menuMap = useMemo(() => createMenuMap(menu), [menu]);

  let is404 = matches.some((match: any) => match.data && match.data.notFound);
  if (is404) return <NotFound />;

  return (
    <div className="flex">
      <div
        ref={scrollRef}
        className="sticky top-0 min-w-0 h-screen flex-shrink-0 overflow-auto"
      >
        <Menu menu={menu} version={version} versions={versions} />
      </div>
      <DataOutlet context={menuMap} />
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

export function unstable_shouldReload() {
  return false;
}

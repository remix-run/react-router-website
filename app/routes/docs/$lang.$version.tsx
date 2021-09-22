import { useMemo } from "react";
import type { LoaderFunction } from "remix";
import { useMatches, json, useLoaderData } from "remix";

import { DataOutlet } from "~/components/data-outlet";
import { getMenu, getVersions, MenuDir, VersionHead } from "~/utils.server";
import { addTrailingSlash } from "~/utils/with-trailing-slash";
import { time } from "~/utils/time";
import { createMenuMap, Menu } from "~/components/docs-menu";
import markdownStyles from "../../styles/docs.css";

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

  let menuMap = useMemo(() => createMenuMap(menu), [menu]);

  let is404 = matches.some((match: any) => match.data && match.data.notFound);
  if (is404) return <NotFound />;

  return (
    <div className="container">
      <div className="lg:flex py-6 md:py-8 lg:py-10">
        <div className="lg:hidden">
          <details>
            <summary className="py-4">Docs Navigation</summary>
            <Menu
              menu={menu}
              version={version}
              versions={versions}
              className="font-medium text-base py-6"
            />
          </details>
          <hr className="mb-4" />
        </div>
        <div
          className={`
            hidden lg:block
            static
            z-10
            inset-0
            flex-none
            h-auto w-60 xl:w-72
            overflow-y-visible
        `}
        >
          <div className="h-full overflow-y-auto scrolling-touch lg:h-auto lg:block lg:sticky lg:bg-transparent overflow-hidden lg:top-18 mr-24 lg:mr-0">
            <Menu
              menu={menu}
              version={version}
              versions={versions}
              className={`
                mr-8
                overflow-y-auto
                font-medium text-base lg:text-sm
                lg:sticky`}
            />
          </div>
        </div>
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

export function unstable_shouldReload() {
  return false;
}

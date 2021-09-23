import * as React from "react";
import type { LoaderFunction } from "remix";
import { useMatches, json, useLoaderData } from "remix";
import { useLocation } from "react-router-dom";
import cx from "clsx";
import { DataOutlet } from "~/components/data-outlet";
import { getMenu, getVersions, MenuDir, VersionHead } from "~/utils.server";
import { addTrailingSlash } from "~/utils/with-trailing-slash";
import { time } from "~/utils/time";
import {
  createMenuMap,
  Menu,
  MenuVersionSelector,
} from "~/components/docs-menu";
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

  let menuMap = React.useMemo(() => createMenuMap(menu), [menu]);

  let is404 = matches.some((match: any) => match.data && match.data.notFound);
  if (is404) return <NotFound />;

  let location = useLocation();
  let detailsRef = React.useRef<HTMLDetailsElement>(null);
  React.useEffect(() => {
    let details = detailsRef.current;
    if (details && details.hasAttribute("open")) {
      details.removeAttribute("open");
    }
  }, [location]);

  return (
    <div className="md-layout lg:flex lg:h-full md-down:container">
      <div className="lg:hidden">
        <details ref={detailsRef}>
          <summary className="py-4">Docs Navigation</summary>
          <div>
            <MenuVersionSelector
              className="mb-10"
              versions={versions}
              version={version}
            />
            <Menu menu={menu} className="font-medium text-base py-6" />
          </div>
        </details>
        <hr className="mb-4" />
      </div>
      <div className="hidden lg:block flex-shrink-0">
        <div
          className={cx([
            // Sidebar nav scroll container
            "h-full max-h-screen overflow-x-hidden overflow-y-auto", // auto scrolling
            "sticky top-[-1rem]", // sticky behavior
            "w-64 xl:w-80 2xl:w-96", // width
            "py-10 pl-6 pr-6 xl:pr-10 2xl:pr-12", // spacing
          ])}
        >
          <MenuVersionSelector
            className="mb-10"
            versions={versions}
            version={version}
          />
          <Menu menu={menu} />
        </div>
      </div>
      <div className="lg:z-[1] flex-grow lg:h-full">
        <div className="py-6 md:py-8 lg:py-10 lg:pr-6">
          <DataOutlet context={menuMap} />
        </div>
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

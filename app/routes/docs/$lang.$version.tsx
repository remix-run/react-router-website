import * as React from "react";
import invariant from "tiny-invariant";
import { json, useLoaderData, Outlet } from "remix";
import type { LoaderFunction } from "remix";
import { useLocation } from "react-router-dom";
import cx from "clsx";

import { getMenu, MenuNode } from "~/utils.server";
import markdownStyles from "~/styles/docs.css";
import { Menu } from "~/components/docs-menu";
import { ensureLangAndVersion } from "~/lib/ensure-lang-version";
import { CACHE_CONTROL } from "~/utils/http";

export let loader: LoaderFunction = async ({ params }) => {
  invariant(!!params.version, "Need a version param");
  invariant(!!params.lang, "Need a lang param");

  await ensureLangAndVersion(params);

  let menu: MenuNode[] = await getMenu(params.version, params.lang);
  return json(menu, { headers: { "Cache-Control": CACHE_CONTROL } });
};

export function links() {
  return [{ rel: "stylesheet", href: markdownStyles }];
}

export default function DocsLayout() {
  let menu = useLoaderData<MenuNode[]>();
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
      {menu.length > 0 ? (
        <div className="lg:hidden">
          <details ref={detailsRef}>
            <summary className="py-4">Docs Navigation</summary>
            <div>
              <Menu nodes={menu} className="py-6 text-base font-medium" />
            </div>
          </details>
          <hr className="mb-4" />
        </div>
      ) : null}
      {menu.length > 0 ? (
        <div className="flex-shrink-0 hidden lg:block">
          <div
            className={cx([
              // Sidebar nav scroll container
              "h-full max-h-screen overflow-x-hidden overflow-y-auto", // auto scrolling
              "sticky top-[-1rem]", // sticky behavior
              "w-64 xl:w-80 2xl:w-96", // width
              "py-10 pl-6 pr-3 xl:pr-5 2xl:pr-6", // spacing
            ])}
          >
            <Menu nodes={menu} />
          </div>
        </div>
      ) : null}
      <div className="lg:z-[1] flex-grow lg:h-full">
        <div className="py-6 md:py-8 lg:py-10 lg:pr-6 lg:pl-3 xl:pl-5 2xl:pl-6">
          <Outlet />
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

// function usePrevious<V>(value: V) {
//   const ref = React.useRef<V>();
//   React.useEffect(() => {
//     ref.current = value;
//   });
//   return ref.current;
// }

// function useFancyPantsActiveLinkHighlights() {
//   let [found, setFound] = React.useState<{
//     heading: Element | null;
//     anchor: Element | null;
//   }>({
//     heading: null,
//     anchor: null,
//   });

//   React.useEffect(() => {
//     let proseContainer = document.querySelector<HTMLDivElement>(".md-prose");
//     let toc = document.querySelector<HTMLUListElement>(
//       ".markdown.has-toc .toc"
//     );
//     if (!toc || !proseContainer) {
//       return;
//     }
//     let headings =
//       proseContainer.querySelectorAll<HTMLHeadingElement>("h2, h3, h4");

//     let observer = new IntersectionObserver(
//       (entries) => {
//         for (let entry of entries) {
//           if (entry.isIntersecting) {
//             setFound({
//               heading: entry.target,
//               anchor: getAnchor(entry.target),
//             });
//           }
//         }
//       },
//       {
//         root: null,
//         rootMargin: "-50% 0% -50% 0%",
//         threshold: 0,
//       }
//     );

//     for (let heading of headings) {
//       observer.observe(heading);
//     }
//     window.requestAnimationFrame(() => {
//       if (!found.heading) {
//         setFound({
//           heading: headings[0],
//           anchor: getAnchor(headings[0]),
//         });
//       }
//     });
//     return () => observer.disconnect();

//     function getAnchor(heading: Element) {
//       let id = heading.id;
//       return toc?.querySelector(`[href="#${id}"]`) || null;
//     }
//   }, []);

//   let anchor = found.anchor;
//   let previousAnchor = usePrevious(anchor);

//   React.useEffect(() => {
//     if (previousAnchor?.hasAttribute("data-active")) {
//       previousAnchor.removeAttribute("data-active");
//     }
//     anchor?.setAttribute("data-active", "");
//   }, [anchor]);
// }

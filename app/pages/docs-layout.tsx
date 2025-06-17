import { preload } from "react-dom";
import { Outlet, redirect } from "react-router";
import classNames from "classnames";

import { Header } from "~/components/docs-header/docs-header";
import { getHeaderData } from "~/components/docs-header/data.server";
import { Footer } from "~/components/docs-footer";
import { NavMenuDesktop } from "~/components/docs-menu/menu-desktop";
import { NavMenuMobile } from "~/components/docs-menu/menu-mobile";
import { loadDocsMenu } from "~/components/docs-menu/data.server";
import { Menu } from "~/components/docs-menu/menu";
import type { Route } from "./+types/docs-layout";
import semver from "semver";
import { useRef } from "react";
import { useCodeBlockCopyButton } from "~/ui/utils";

import {
  menuCollapseContext,
  menuCollapseStateMiddleware,
} from "~/actions/menu-collapse/server";

import docsCss from "~/styles/docs.css?url";

export let unstable_middleware = [menuCollapseStateMiddleware];

export async function loader({ request, params, context }: Route.LoaderArgs) {
  let url = new URL(request.url);
  if (!url.pathname.endsWith("/")) {
    url.pathname += "/";
  }

  // the /:ref param should only be used for v6 docs
  if (params.ref) {
    // if the ref is not a valid semver, this is 404
    if (
      params.ref !== "local" &&
      params.ref !== "dev" &&
      !semver.valid(params.ref)
    ) {
      throw new Response("Not Found", { status: 404 });
    }

    // if ref is not a v6 ref, redirect to the /home of that ref
    if (!url.pathname.match(/^\/?(6)/)) {
      throw redirect(url.pathname + "home");
    }
  }

  let splat = params["*"];
  let firstSegment = splat?.split("/")[0];
  let refParam = params.ref
    ? params.ref
    : firstSegment === "dev" ||
        firstSegment === "local" ||
        semver.valid(firstSegment)
      ? firstSegment
      : undefined;

  let ref = refParam || "main";

  let [menu, header] = await Promise.all([
    loadDocsMenu(ref),
    getHeaderData("en", ref, refParam),
  ]);

  // Only retain the menu collapse state on the main branch to avoid bleeding
  // to other branches
  let menuCollapseState =
    header.currentGitHubRef === "main"
      ? menuCollapseContext(context).get()
      : {};

  return {
    menu,
    header,
    menuCollapseState,
  };
}

export async function clientLoader({ serverLoader }: Route.ClientLoaderArgs) {
  preload(docsCss, { as: "style" });
  return await serverLoader();
}

export default function DocsLayout({ loaderData }: Route.ComponentProps) {
  const { menu, header } = loaderData;

  let docsContainer = useRef<HTMLDivElement>(null);
  useCodeBlockCopyButton(docsContainer);

  const changelogHref = header.hasAPIDocs
    ? header.refParam
      ? `/${header.refParam}/changelog`
      : "/changelog"
    : undefined;

  return (
    <>
      <link rel="stylesheet" href={docsCss} />
      <div className="[--header-height:theme(spacing.16)] [--nav-width:theme(spacing.72)] lg:m-auto lg:max-w-[90rem]">
        <div className="sticky top-0 z-20">
          <Header />
          <NavMenuMobile>
            <Menu menu={menu} changelogHref={changelogHref} />
          </NavMenuMobile>
        </div>

        <div className="block lg:flex">
          <NavMenuDesktop>
            <Menu menu={menu} changelogHref={changelogHref} />
          </NavMenuDesktop>
          <div
            ref={docsContainer}
            className={classNames(
              // add scroll margin to focused elements so that they aren't
              // obscured by the sticky header
              "[&_*:focus]:scroll-mt-[8rem] lg:[&_*:focus]:scroll-mt-[5rem]",
              // Account for the left navbar
              "min-h-[80vh] lg:ml-3 lg:w-[calc(100%-var(--nav-width))]",
              "flex flex-col lg:pl-6 xl:pl-10 2xl:pl-12",
            )}
          >
            <Outlet />
            <div className="mt-auto px-4 pt-8 lg:pr-8 xl:pl-0">
              <Footer />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

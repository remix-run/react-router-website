import { Outlet } from "react-router";
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

import docsCss from "~/styles/docs.css?url";

export let loader = async ({ params }: Route.LoaderArgs) => {
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

  return { menu, header };
};

export default function DocsLayout({ loaderData }: Route.ComponentProps) {
  const { menu } = loaderData;

  let docsContainer = useRef<HTMLDivElement>(null);
  useCodeBlockCopyButton(docsContainer);

  return (
    <>
      <link rel="stylesheet" href={docsCss} />
      <div className="[--header-height:theme(spacing.16)] [--nav-width:theme(spacing.72)] lg:m-auto lg:max-w-[90rem]">
        <div className="sticky top-0 z-20">
          <Header />
          <NavMenuMobile>
            <Menu menu={menu} />
          </NavMenuMobile>
        </div>

        <div className="block lg:flex">
          <NavMenuDesktop>
            <Menu menu={menu} />
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

import type { LinksFunction, LoaderFunctionArgs } from "react-router";
import { type ShouldRevalidateFunction, Outlet } from "react-router";
import classNames from "classnames";

import docsStylesheet from "~/styles/docs.css?url";
import { Header } from "~/components/docs-header/docs-header";
import { getHeaderData } from "~/components/docs-header/data.server";
import { Footer } from "~/components/docs-footer";
import { NavMenuDesktop } from "~/components/docs-menu/menu-desktop";
import { NavMenuMobile } from "~/components/docs-menu/menu-mobile";
import { loadDocsMenu } from "~/components/docs-menu/data.server";
import { Menu } from "~/components/docs-menu/menu";

export let links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: docsStylesheet }];
};

export let loader = async ({ params }: LoaderFunctionArgs) => {
  let { ref } = params;

  let [menu, header] = await Promise.all([
    loadDocsMenu(ref || "main"),
    getHeaderData("en", ref),
  ]);

  return { menu, header };
};

export const shouldRevalidate: ShouldRevalidateFunction = ({
  currentParams,
  nextParams,
  defaultShouldRevalidate,
}) => {
  // If both refs are defined and the same, the docs navigation is the same
  if (
    currentParams.ref &&
    nextParams.ref &&
    currentParams.ref === nextParams.ref
  ) {
    return false;
  }
  return defaultShouldRevalidate;
};

export default function DocsLayout() {
  return (
    <div className="[--header-height:theme(spacing.16)] [--nav-width:theme(spacing.72)] lg:m-auto lg:max-w-[90rem]">
      <div className="sticky top-0 z-20">
        <Header />
        <NavMenuMobile />
      </div>

      <div className="block lg:flex">
        <NavMenuDesktop>
          <Menu />
        </NavMenuDesktop>
        <div
          className={classNames(
            // add scroll margin to focused elements so that they aren't
            // obscured by the sticky header
            "[&_*:focus]:scroll-mt-[8rem] lg:[&_*:focus]:scroll-mt-[5rem]",
            // Account for the left navbar
            "min-h-[80vh] lg:ml-3 lg:w-[calc(100%-var(--nav-width))]",
            "flex flex-col lg:pl-6 xl:pl-10 2xl:pl-12"
          )}
        >
          <Outlet />
          <div className="mt-auto px-4 pt-8 lg:pr-8 xl:pl-0">
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
}

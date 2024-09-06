import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import classNames from "classnames";
import { getRepoDocsMenu } from "~/modules/gh-docs/.server";

import docsStylesheet from "~/styles/docs.css?url";
import { Header } from "~/components/docs-header/docs-header";
import { getHeaderData } from "~/components/docs-header/data.server";
import { Footer } from "~/components/docs-footer";
import { NavMenuDesktop } from "~/components/docs-menu/menu-desktop";
import { NavMenuMobile } from "~/components/docs-menu/menu-mobile";
import { loadReferenceMenu } from "~/components/docs-menu/data.server";
import invariant from "tiny-invariant";

export let links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: docsStylesheet }];
};

export let loader = async ({ params }: LoaderFunctionArgs) => {
  let { ref, pkg, "*": splat } = params;
  invariant(pkg, `Expected params.pkg`);

  let [menu, header] = await Promise.all([
    loadReferenceMenu(ref || "main", pkg),
    getHeaderData("en", ref || "main", splat),
  ]);

  return json({ menu, header });
};

export function headers() {
  return { "Cache-Control": "max-age=300" };
}

export default function DocsLayout() {
  return (
    <div className="[--header-height:theme(spacing.16)] [--nav-width:theme(spacing.72)] lg:m-auto lg:max-w-[90rem]">
      <div className="sticky top-0 z-20">
        <Header />
        <NavMenuMobile />
      </div>

      <div className="block lg:flex">
        <NavMenuDesktop />
        <div
          className={classNames(
            // add scroll margin to focused elements so that they aren't
            // obscured by the sticky header
            "[&_*:focus]:scroll-mt-[8rem] lg:[&_*:focus]:scroll-mt-[5rem]",
            // Account for the left navbar
            "min-h-[80vh] lg:ml-3 lg:w-[calc(100%-var(--nav-width))]",
            "lg:pl-6 xl:pl-10 2xl:pl-12 flex flex-col"
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

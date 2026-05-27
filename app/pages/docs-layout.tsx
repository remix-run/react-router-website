import { Outlet, redirect } from "react-router";
import { clsx } from "clsx";

import { Header } from "~/components/docs-header/docs-header";
import { getHeaderData } from "~/components/docs-header/data.server";
import { getRepoDocsMenu, getRepoTags } from "~/modules/gh-docs/.server";
import { getLatestVersion } from "~/modules/gh-docs/.server/tags";
import { resolveRef } from "~/modules/gh-docs/.server/doc-url-parser";
import { Footer } from "~/components/docs-footer";
import { VersionWarning } from "~/components/version-warning";
import { NavMenuDesktop } from "~/components/docs-menu/menu-desktop";
import { NavMenuMobile } from "~/components/docs-menu/menu-mobile";
import { Menu } from "~/components/docs-menu/menu";
import type { Route } from "./+types/docs-layout";
import semver from "semver";
import { useRef } from "react";
import { useCodeBlockCopyButton } from "~/ui/utils";

import docsCss from "~/styles/docs.css?url";

export async function loader({ url, params }: Route.LoaderArgs) {
  let pathname = url.pathname;
  if (!pathname.endsWith("/")) {
    pathname += "/";
  }

  // The /:ref param is only valid for v6 docs (semver) or "local". Anything
  // else 404s; non-v6 refs redirect to /:ref/home.
  if (params.ref) {
    if (params.ref !== "local" && !semver.valid(params.ref)) {
      throw new Response("Not Found", { status: 404 });
    }
    if (!pathname.match(/^\/?(6)/)) {
      throw redirect(pathname + "home");
    }
  }

  let tags = await getRepoTags();
  if (!tags) throw new Response("Cannot reach GitHub", { status: 503 });
  let latestVersion = getLatestVersion(tags);

  let { ref, refParam } = resolveRef(params["*"], latestVersion, params.ref);

  let [menu, header] = await Promise.all([
    getRepoDocsMenu(ref),
    getHeaderData("en", ref, tags, refParam),
  ]);

  return {
    menu,
    header,
  };
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
      <link rel="stylesheet" href={docsCss} precedence="high" />
      <div className="[--header-height:theme(spacing.16)] [--nav-width:theme(spacing.72)] lg:m-auto lg:max-w-[90rem]">
        <div className="sticky top-0 z-20">
          <Header />
          <VersionWarning />
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
            className={clsx(
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

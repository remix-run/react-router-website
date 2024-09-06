import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Outlet,
  useLoaderData,
  useNavigation,
  useParams,
} from "@remix-run/react";
import classNames from "classnames";
import invariant from "tiny-invariant";

import {
  getRepoBranches,
  getRepoTags,
  getRepoDocsReferenceMenu,
  validateParams,
} from "~/modules/gh-docs/.server";
import { getLatestVersion } from "~/modules/gh-docs/.server/tags";

import docsStylesheet from "~/styles/docs.css?url";

import {
  Footer,
  Header,
  NavMenuDesktop,
  NavMenuMobile,
} from "../pages/docs-layout";

export let links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: docsStylesheet }];
};

export let loader = async ({ params }: LoaderFunctionArgs) => {
  let { ref, "*": splat } = params;
  invariant(ref, "expected `params.ref`");

  let branchesInMenu = ["main", "dev"];
  let [tags, branches] = await Promise.all([getRepoTags(), getRepoBranches()]);
  if (!tags || !branches)
    throw new Response("Cannot reach GitHub", { status: 503 });

  if (process.env.NODE_ENV === "development") {
    branches.push("local");
    branchesInMenu.push("local");
  }

  let betterUrl = validateParams(tags, branches, {
    // API docs are always en
    lang: "en",
    ref,
    "*": splat,
  });
  if (betterUrl) throw redirect("/" + betterUrl);

  let menu = await getRepoDocsReferenceMenu(ref);
  let releaseBranch = "main";
  let latestVersion = getLatestVersion(tags);
  let isLatest = ref === releaseBranch || ref === latestVersion;

  let pkgName = "react-router";
  if (splat) {
    let [part1, part2] = splat.split("/");
    let isNamespace = part1.startsWith("@");
    pkgName = isNamespace ? `${part1}/${part2}` : part1;
  }

  return json({
    pkgName,
    menu,
    versions: [getLatestVersion(tags)],
    latestVersion,
    releaseBranch,
    branches: branchesInMenu,
    currentGitHubRef: ref,
    isLatest,
  });
};

export function headers() {
  return { "Cache-Control": "max-age=300" };
}

export default function Reference() {
  let { menu, pkgName } = useLoaderData<typeof loader>();
  let pkgMenu = menu.find((m) => m.attrs.title === pkgName)?.children;
  invariant(pkgMenu, `Expected package menu for ${pkgName}`);

  let navigation = useNavigation();
  let navigating = navigation.location && !navigation.formData;
  let params = useParams();
  let changingVersions =
    !navigation.formData &&
    navigation.location &&
    params.ref &&
    // TODO: we should have `transition.params`
    !navigation.location.pathname.match(params.ref);

  let pkgs = menu.map((m) => m.attrs.title);

  return (
    <div className="[--header-height:theme(spacing.16)] [--nav-width:theme(spacing.72)] lg:m-auto lg:max-w-[90rem]">
      <div className="sticky top-0 z-20">
        <Header />
        <NavMenuMobile menu={pkgMenu} />
      </div>
      <div
        className={
          changingVersions
            ? "opacity-25 transition-opacity delay-300"
            : undefined
        }
      >
        <div className="block lg:flex">
          <NavMenuDesktop pkgs={pkgs} menu={pkgMenu} pkg={pkgName} />
          <div
            className={classNames(
              // add scroll margin to focused elements so that they aren't
              // obscured by the sticky header
              "[&_*:focus]:scroll-mt-[8rem] lg:[&_*:focus]:scroll-mt-[5rem]",
              // Account for the left navbar
              "min-h-[80vh] lg:ml-3 lg:w-[calc(100%-var(--nav-width))]",
              "lg:pl-6 xl:pl-10 2xl:pl-12",
              !changingVersions && navigating
                ? "opacity-25 transition-opacity delay-300"
                : "",
              "flex flex-col"
            )}
          >
            <Outlet />
            <div className="mt-auto px-4 pt-8 lg:pr-8 xl:pl-0">
              <Footer />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

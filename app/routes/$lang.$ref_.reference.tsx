import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Outlet, useLoaderData, useNavigation } from "@remix-run/react";
import classNames from "classnames";
import { useParams } from "react-router-dom";
import invariant from "tiny-invariant";

import {
  getRepoBranches,
  getRepoTags,
  getRepoDocsReferenceMenu,
  validateParams,
} from "~/modules/gh-docs/.server";
import { getLatestVersion } from "~/modules/gh-docs/.server/tags";

import docsStylesheet from "~/styles/docs.css?url";

import { Footer, Header, NavMenuDesktop, NavMenuMobile } from "./$lang.$ref";

export let links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: docsStylesheet }];
};

export let loader = async ({ params }: LoaderFunctionArgs) => {
  let { lang, ref, "*": splat } = params;
  invariant(lang, "expected `params.lang`");
  invariant(ref, "expected `params.ref`");

  let branchesInMenu = ["main", "dev"];
  let [tags, branches] = await Promise.all([getRepoTags(), getRepoBranches()]);
  if (!tags || !branches)
    throw new Response("Cannot reach GitHub", { status: 503 });

  if (process.env.NODE_ENV === "development") {
    branches.push("local");
    branchesInMenu.push("local");
  }

  let betterUrl = validateParams(tags, branches, { lang, ref, "*": splat });
  if (betterUrl) throw redirect("/" + betterUrl);

  const menu = await getRepoDocsReferenceMenu(ref, lang);
  // let menu = await getRepoDocsReferenceMenu(ref, lang);
  let releaseBranch = "main";
  let latestVersion = getLatestVersion(tags);
  let isLatest = ref === releaseBranch || ref === latestVersion;

  return json({
    menu,
    versions: [getLatestVersion(tags)],
    latestVersion,
    releaseBranch,
    branches: branchesInMenu,
    currentGitHubRef: ref,
    lang,
    isLatest,
  });
};

export function headers() {
  return { "Cache-Control": "max-age=300" };
}

export let unstable_shouldReload = () => false;

export default function Reference() {
  let { menu } = useLoaderData<typeof loader>();
  let navigation = useNavigation();
  let navigating = navigation.location && !navigation.formData;
  let params = useParams();
  let changingVersions =
    !navigation.formData &&
    navigation.location &&
    params.ref &&
    // TODO: we should have `transition.params`
    !navigation.location.pathname.match(params.ref);

  return (
    <div className="[--header-height:theme(spacing.16)] [--nav-width:theme(spacing.72)] lg:m-auto lg:max-w-[90rem]">
      <div className="sticky top-0 z-20">
        <Header />
        <NavMenuMobile menu={menu} />
      </div>
      <div
        className={
          changingVersions
            ? "opacity-25 transition-opacity delay-300"
            : undefined
        }
      >
        <div className="block lg:flex">
          <NavMenuDesktop menu={menu} />
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

import { json, redirect } from "@remix-run/node";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import * as React from "react";
import {
  Form,
  Link,
  Outlet,
  useLoaderData,
  useLocation,
  useMatches,
  useTransition,
} from "@remix-run/react";
import invariant from "tiny-invariant";
import { matchPath, useParams, useResolvedPath } from "react-router-dom";
import classNames from "classnames";
import {
  getRepoBranches,
  getRepoDocsMenu,
  getRepoTags,
  validateParams,
} from "~/gh-docs";
import type { Doc, MenuDoc } from "~/gh-docs";
import iconsHref from "~/icons.svg";
import { DetailsMenu } from "~/components/details-menu";
import { getPrefs, serializePrefs } from "~/http";
import { useOptimisticColorScheme } from "~/components/color-scheme";
import { getLatestVersion } from "~/gh-docs/tags";

type LoaderData = {
  menu: MenuDoc[];
  versions: string[];
  latestVersion: string;
  releaseBranch: string;
  branches: string[];
  lang: string;
  currentGitHubRef: string;
};

export let action: ActionFunction = async ({ request }) => {
  let prefs = await getPrefs(request);
  let data = await request.formData();
  let colorScheme = data.get("colorScheme");
  let returnTo = data.get("returnTo");

  if (typeof colorScheme !== "string" || typeof returnTo !== "string") {
    throw new Response("Bad Request", { status: 400 });
  }

  prefs.colorScheme = colorScheme;
  return redirect(returnTo, {
    headers: { "Set-Cookie": await serializePrefs(prefs) },
  });
};

export let loader: LoaderFunction = async ({ params, request }) => {
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

  let menu = await getRepoDocsMenu(ref, lang);
  return json<LoaderData>({
    menu,
    // TODO: after updating v3/v5 docs, include them here too
    versions: [getLatestVersion(tags)],
    latestVersion: getLatestVersion(tags),
    releaseBranch: "main",
    branches: branchesInMenu,
    currentGitHubRef: ref,
    lang,
  });
};

export function headers() {
  return { "Cache-Control": "max-age=300" };
}

export default function DocsLayout() {
  let navigation = useTransition();
  let navigating = navigation.location && !navigation.submission;
  let params = useParams();
  let changingVersions =
    navigation.location &&
    params.ref &&
    !navigation.location.pathname.match(params.ref);

  return (
    <div className="lg:m-auto lg:max-w-6xl">
      <div className="sticky top-0 z-20">
        <Header />
        <NavMenuMobile />
      </div>
      <div
        className={
          changingVersions ? "opacity-25 transition-opacity delay-300" : ""
        }
      >
        <NavMenuDesktop />
        <div className="px-4 py-8 lg:ml-80 lg:px-8">
          <div
            className={classNames(
              "min-h-[80vh]",
              !changingVersions && navigating
                ? "opacity-25 transition-opacity delay-300"
                : ""
            )}
          >
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

function Header() {
  return (
    <div className="relative z-20 flex h-16 w-full items-center justify-between border-b border-gray-50 bg-white px-4 py-3 text-gray-900 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100 lg:px-8">
      <div className="flex items-center gap-4">
        <Link to="." className="flex items-center gap-1">
          <svg
            aria-label="React Router logo, nine dots in an upward triangle (one on top, two in the middle, three on the bottom) with a path of three highlighted and connected from top to bottom"
            className="h-14 w-14 md:h-12 md:w-12"
          >
            <use href={`${iconsHref}#logo`} />
          </svg>
          <div className="hidden md:block">
            <svg aria-label="React Router" className="h-6 w-40">
              <use href={`${iconsHref}#logotype`} />
            </svg>
          </div>
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <VersionSelect />
        <ColorSchemeToggle />
        <HeaderLink
          className="border-l border-gray-50 pl-4 dark:border-gray-800"
          href="https://github.com/remix-run/react-router"
          svgId="github"
          svgLabel="GitHub octocat logo in a circle"
          title="View code on GitHub"
          svgSize="40x40"
        />
        <HeaderLink
          href="https://rmx.as/discord"
          svgId="discord"
          svgLabel="Discord logo in a circle"
          title="Chat on Discord"
          svgSize="40x40"
        />
        <HeaderLink
          href="https://remix.run"
          svgId="remix"
          svgLabel="Stylized text saying “Made by Remix” with an right pointing arrow."
          svgSize="122x17"
        />
      </div>
    </div>
  );
}

function ColorSchemeToggle() {
  let location = useLocation();
  let colorScheme = useOptimisticColorScheme();

  return (
    <Form replace={true} method="post" className="flex items-center">
      <input
        type="hidden"
        name="returnTo"
        value={location.pathname + location.search}
      />
      <button
        name="colorScheme"
        value={colorScheme === "dark" ? "light" : "dark"}
        className={`flex h-[40px] w-[40px] items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 focus:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:bg-gray-700`}
        title={`Switch to ${colorScheme === "light" ? "dark" : "light"} mode`}
      >
        {colorScheme === "light" ? (
          <svg aria-label="Switch to dark mode" className="h-[18px] w-[18px]">
            <use href={`${iconsHref}#moon`} />
          </svg>
        ) : (
          <svg aria-label="Switch to light mode" className="h-[23px] w-[22px]">
            <use href={`${iconsHref}#sun`} />
          </svg>
        )}
      </button>
    </Form>
  );
}

function HeaderLink({
  className = "",
  href,
  svgId,
  svgLabel,
  svgSize,
  title,
}: {
  className?: string;
  href: string;
  svgId: string;
  svgLabel: string;
  svgSize: string;
  title?: string;
}) {
  const [width, height] = svgSize.split("x");

  return (
    <a
      href={href}
      className={classNames(
        `hidden text-gray-800 hover:text-gray-900 dark:text-gray-100 dark:hover:text-gray-50 md:block`,
        className
      )}
      title={title}
    >
      <svg
        aria-label={svgLabel}
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        <use href={`${iconsHref}#${svgId}`} />
      </svg>
    </a>
  );
}

function NavMenuDesktop() {
  return (
    <div className="fixed top-16 bottom-0 hidden w-80 overflow-auto p-8 lg:block">
      <Menu />
    </div>
  );
}

function useDoc(): Doc | null {
  let data = useMatches().slice(-1)[0].data;
  if (!data) return null;
  return data.doc;
}

function NavMenuMobile() {
  let doc = useDoc();

  return (
    <DetailsMenu className="group relative flex h-full flex-col lg:hidden">
      <summary
        tabIndex={0}
        className="_no-triangle flex cursor-pointer select-none items-center gap-2 border-b border-gray-50 bg-white bg-opacity-75 px-2 py-3 text-sm font-medium hover:bg-gray-50 active:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:bg-opacity-50 dark:hover:bg-gray-800 dark:active:bg-gray-700"
      >
        <div className="flex items-center gap-2">
          <svg aria-hidden className="h-5 w-5 group-open:hidden">
            <use href={`${iconsHref}#chevron-r`} />
          </svg>
          <svg aria-hidden className="hidden h-5 w-5 group-open:block">
            <use href={`${iconsHref}#chevron-d`} />
          </svg>
        </div>
        <div className="whitespace-nowrap font-bold">
          {doc ? doc.attrs.title : "Navigation"}
        </div>
      </summary>
      <div className="absolute h-[66vh] w-full overflow-auto overscroll-contain border-b bg-white p-3 shadow-2xl dark:border-gray-700 dark:bg-gray-900 dark:shadow-black">
        <Menu />
      </div>
    </DetailsMenu>
  );
}

function VersionSelect() {
  let {
    versions,
    latestVersion,
    releaseBranch,
    branches,
    currentGitHubRef,
    lang,
  } = useLoaderData<LoaderData>();

  return (
    <DetailsMenu className="relative">
      <summary className="_no-triangle relative flex h-[40px] cursor-pointer list-none items-center justify-center gap-1 gap-3 rounded-full border border-transparent bg-gray-100 px-3 hover:bg-gray-200 focus:border focus:border-gray-100 focus:bg-white dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:bg-gray-700">
        <div>{currentGitHubRef}</div>
        <svg aria-hidden className="h-[18px] w-[18px] text-gray-400">
          <use href={`${iconsHref}#dropdown-arrows`} />
        </svg>
      </summary>
      <div className="absolute right-0 z-20">
        <div className="relative top-1 w-48 rounded-lg bg-white p-4 shadow dark:bg-gray-800">
          <VersionsLabel label="Branches" />
          {branches.map((branch) => (
            <VersionLink
              key={branch}
              to={currentGitHubRef === branch ? "" : `/${lang}/${branch}`}
            >
              {releaseBranch === branch ? `main (${latestVersion})` : branch}
            </VersionLink>
          ))}

          <VersionsLabel label="Versions" />
          {versions.map((version) => (
            <VersionLink
              key={version}
              to={currentGitHubRef === version ? "" : `/${lang}/${version}`}
            >
              {version}
            </VersionLink>
          ))}
        </div>
      </div>
    </DetailsMenu>
  );
}

function VersionsLabel({ label }: { label: string }) {
  return (
    <div className="pt-2 pb-2 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-300">
      {label}
    </div>
  );
}
function VersionLink({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) {
  let isActive = useIsActivePath(to);
  let className =
    "group items-center flex pl-1 py-1 before:mr-2 before:block before:h-1.5 before:w-1.5 before:rounded-full before:content-['']";

  return to ? (
    <Link
      className={classNames(
        className,
        "before:bg-transparent before:hover:bg-gray-200 dark:before:hover:bg-gray-300",
        isActive
          ? "text-red-brand"
          : "text-gray-800 active:text-red-brand dark:text-gray-100"
      )}
      to={to}
    >
      {children}
    </Link>
  ) : (
    <span
      className={classNames(className, "text-red-brand before:bg-red-brand")}
    >
      {children}
    </span>
  );
}

function useIsActivePath(to: string) {
  let { pathname } = useResolvedPath(to);
  let navigation = useTransition();
  let currentLocation = useLocation();
  let location =
    navigation.location && !navigation.submission
      ? navigation.location
      : currentLocation;
  let match = matchPath(pathname + "/*", location.pathname);
  return Boolean(match);
}

function MenuCategoryLink({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) {
  let isActive = useIsActivePath(to);

  return (
    <Link
      prefetch="intent"
      to={to}
      className={classNames(
        // link styles
        "group -mx-4 flex items-center py-2 lg:text-sm",
        isActive
          ? "font-bold text-red-brand"
          : "text-gray-600 dark:text-gray-300",

        // active pill styles
        "before:mr-2 before:block before:h-2 before:w-2 before:rounded-full before:content-['']",
        isActive
          ? "before:bg-red-brand"
          : "before:bg-transparent before:hover:bg-gray-200 dark:before:hover:bg-gray-300"
      )}
      children={children}
    />
  );
}

function MenuLink({ to, children }: { to: string; children: React.ReactNode }) {
  let isActive = useIsActivePath(to);

  return (
    <Link
      prefetch="intent"
      to={to}
      className={classNames(
        // link styles
        "group flex items-center py-1",
        isActive ? "font-bold text-red-brand" : "",

        // active pill styles
        "before:mr-4 before:block before:h-2 before:w-2 before:rounded-full before:content-['']",
        isActive
          ? "before:bg-red-brand"
          : "before:bg-transparent before:hover:bg-gray-200 dark:before:hover:bg-gray-600"
      )}
      children={children}
    />
  );
}

function Menu() {
  let { menu } = useLoaderData<LoaderData>();
  return (
    <nav>
      <ul>
        {menu.map((category) => (
          <li key={category.attrs.title} className="mb-6">
            {category.hasContent ? (
              <MenuCategoryLink to={category.slug}>
                {category.attrs.title}
              </MenuCategoryLink>
            ) : (
              <div className="mb-2 block text-sm font-bold uppercase tracking-wider text-gray-400">
                {category.attrs.title}
              </div>
            )}
            {category.children.map((doc) => (
              <MenuLink key={doc.slug} to={doc.slug}>
                {doc.attrs.title} {doc.attrs.new && "🆕"}
              </MenuLink>
            ))}
          </li>
        ))}
      </ul>
    </nav>
  );
}

function Footer() {
  let doc = useDoc();
  let repoUrl = "https://github.com/remix-run/react-router";
  let editUrl = doc ? `${repoUrl}/edit/main/docs/${doc.slug}.md` : null;
  return (
    <div className="mt-16 flex justify-between border-t pt-4 text-sm text-gray-500 dark:border-gray-600">
      <div className="lg:flex lg:items-center">
        <div className="pr-4">
          &copy;{" "}
          <a className="hover:underline" href="https://remix.run">
            Remix Software, Inc.
          </a>
        </div>
        <div className="hidden lg:block">•</div>
        <div className="lg:pl-4">
          Docs and examples{" "}
          <a
            className="hover:underline"
            href="https://creativecommons.org/licenses/by/4.0/"
          >
            CC 4.0
          </a>
        </div>
      </div>
      <div>
        {editUrl && (
          <a className="flex items-center gap-1 hover:underline" href={editUrl}>
            Edit
            <svg aria-hidden className="h-4 w-4">
              <use href={`${iconsHref}#edit`} />
            </svg>
          </a>
        )}
      </div>
    </div>
  );
}

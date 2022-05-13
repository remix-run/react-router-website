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
import { matchPath, useResolvedPath } from "react-router-dom";
import classNames from "classnames";
import { getRepoDocsMenu, getRepoTags, validateParams } from "~/gh-docs";
import type { MenuDoc } from "~/gh-docs";
import iconsHref from "~/icons.svg";
import { DetailsMenu } from "~/components/details-menu";
import { getPrefs, serializePrefs } from "~/http";
import { useOptimisticColorScheme } from "~/components/color-scheme";

type LoaderData = {
  menu: MenuDoc[];
  versions: string[];
  branches: string[];
  lang: string;
  currentGitHubRef: string;
};

export let action: ActionFunction = async ({ params, request }) => {
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
  let { lang, ref } = params;
  invariant(lang, "expected `params.lang`");
  invariant(ref, "expected `params.ref`");

  let tags = await getRepoTags();
  if (!tags) throw new Response("Cannot reach GitHub", { status: 503 });

  let branches = ["main", "dev"];

  if (process.env.NODE_ENV === "development") {
    branches.push("local");
  }

  let betterUrl = validateParams(tags, branches, { lang, ref });
  if (betterUrl) throw redirect("/" + betterUrl);

  let menu = await getRepoDocsMenu(ref, lang);
  return json<LoaderData>({
    menu,
    versions: tags.slice(0, 1),
    branches,
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

  return (
    <div className="lg:m-auto lg:max-w-6xl">
      <div className="sticky top-0 z-20">
        <Header />
        <NavMenuMobile />
      </div>
      <NavMenuDesktop />
      <div className="px-4 py-8 lg:ml-72 lg:px-8">
        <div
          className={classNames(
            "min-h-[80vh]",
            navigating ? "opacity-25 transition-opacity delay-300" : ""
          )}
        >
          <Outlet />
        </div>
        <Footer />
      </div>
    </div>
  );
}

function Header() {
  return (
    <div className="relative z-20 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white bg-opacity-80 px-4 py-3 text-gray-900 backdrop-blur dark:border-gray-700 dark:bg-gray-900 dark:bg-opacity-50 dark:text-gray-100 lg:px-8">
      <div className="flex items-center gap-4">
        <Link to="." className="flex items-center gap-1">
          <svg
            aria-label="React Router logo, nine dots in an upward triangle (one on top, two in the middle, three on the bottom) with a path of three highlighted and connected from top to bottom"
            className="h-10 w-10 md:h-12 md:w-12"
          >
            <use href={`${iconsHref}#logo`} />
          </svg>
          <div className="hidden md:block">
            <svg aria-label="React Router" className="w-40">
              <use href={`${iconsHref}#logotype`} />
            </svg>
          </div>
        </Link>
        <VersionSelect />
        <ColorSchemeToggle />
      </div>
      <div className="flex items-center gap-4">
        <HeaderLink
          className="hidden md:block"
          href="https://github.com/remix-run/react-router"
        >
          GitHub
        </HeaderLink>{" "}
        <HeaderLink className="hidden md:block" href="https://rmx.as/discord">
          Discord
        </HeaderLink>
        <HeaderLink
          href="https://remix.run"
          className="flex items-center gap-1 border-l border-gray-600 pl-2 dark:border-gray-500"
        >
          By{" "}
          <svg aria-hidden className="h-3 w-3">
            <use href={`${iconsHref}#remix-r`} />
          </svg>{" "}
          ↗
        </HeaderLink>
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
        className="rounded-full p-2 hover:bg-gray-900 hover:text-white active:bg-gray-600 active:text-white dark:text-gray-300 dark:hover:bg-gray-100 dark:hover:text-gray-900 dark:active:bg-white dark:active:text-gray-900"
      >
        {colorScheme === "light" ? (
          <svg aria-label="Switch dark mode" className="h-5 w-5">
            <use href={`${iconsHref}#moon`} />
          </svg>
        ) : (
          <svg aria-label="Switch light mode" className="h-5 w-5">
            <use href={`${iconsHref}#sun`} />
          </svg>
        )}
      </button>
    </Form>
  );
}

function HeaderLink({
  href,
  className = "",
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className={classNames(
        "text-sm font-medium text-gray-800 dark:text-gray-200",
        className
      )}
      children={children}
    />
  );
}

function NavMenuDesktop() {
  return (
    <div className="fixed top-16 bottom-0 hidden w-72 overflow-auto p-8 lg:block">
      <Menu />
    </div>
  );
}

function useDoc() {
  let data = useMatches().slice(-1)[0].data;
  invariant(data, "expected child match for the doc");
  return data.doc;
}

function NavMenuMobile() {
  let doc = useDoc();

  return (
    <DetailsMenu className="group relative flex h-full flex-col lg:hidden">
      <summary
        tabIndex={0}
        className="_no-triangle flex cursor-pointer select-none items-center gap-2 border-b border-gray-200 bg-white bg-opacity-75 px-2  py-3 text-sm font-medium backdrop-blur hover:bg-gray-50 active:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:bg-opacity-50 dark:hover:bg-gray-800 dark:active:bg-gray-700"
      >
        <div className="flex items-center gap-2">
          <svg aria-hidden className="h-5 w-5 group-open:hidden">
            <use href={`${iconsHref}#chevron-r`} />
          </svg>
          <svg aria-hidden className="hidden h-5 w-5 group-open:block">
            <use href={`${iconsHref}#chevron-d`} />
          </svg>
        </div>
        <div className="whitespace-nowrap font-bold">{doc.attrs.title}</div>
      </summary>
      <div className="absolute h-[66vh] w-full overflow-auto overscroll-contain border-b bg-white p-3 shadow-lg">
        <Menu />
      </div>
    </DetailsMenu>
  );
}

function VersionSelect() {
  let { versions, branches, currentGitHubRef, lang } =
    useLoaderData<LoaderData>();

  return (
    <DetailsMenu>
      <summary className="_no-triangle relative flex cursor-pointer list-none items-center justify-center gap-1 rounded-full bg-gray-100 px-3 py-2 text-center text-xs font-medium text-gray-600 hover:bg-gray-200 active:bg-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:active:bg-gray-600">
        <div>{currentGitHubRef}</div>
        <svg aria-hidden className="h-3 w-3 text-gray-400">
          <use href={`${iconsHref}#triangle-d`} />
        </svg>
      </summary>
      <div className="absolute z-20">
        <div className="relative top-1 flex items-stretch gap-6 rounded-lg border bg-white p-4 shadow dark:border-gray-600 dark:bg-gray-700">
          <div className="leading-loose">
            <VersionsLabel label="Branches" />
            {branches.map((branch) => (
              <VersionLink key={branch} to={`/${lang}/${branch}`}>
                {branch}
              </VersionLink>
            ))}
          </div>

          <div className="w-0 border-r border-gray-200 dark:border-gray-600" />

          <div>
            <VersionsLabel label="Versions" />
            {versions.map((version) => (
              <VersionLink key={version} to={`/${lang}/${version}`}>
                {version}
              </VersionLink>
            ))}
          </div>
        </div>
      </div>
    </DetailsMenu>
  );
}

function VersionsLabel({ label }: { label: string }) {
  return (
    <div className="mb-2 text-xs font-bold uppercase text-gray-400 dark:text-gray-300">
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
  return (
    <Link
      className="block text-gray-800 hover:underline dark:text-gray-100"
      to={to}
      children={children}
    />
  );
}

function MenuLink({ to, children }: { to: string; children: React.ReactNode }) {
  let { pathname } = useResolvedPath(to);
  let navigation = useTransition();
  let currentLocation = useLocation();
  let location =
    navigation.location && !navigation.submission
      ? navigation.location
      : currentLocation;
  let match = matchPath(pathname, location.pathname);

  return (
    <Link
      prefetch="intent"
      to={to}
      className={classNames(
        // link styles
        "group flex items-center py-2 lg:text-sm",
        match ? "font-bold text-red-brand" : "text-gray-600 dark:text-gray-300",

        // active pill styles
        "before:mr-2 before:block before:h-1 before:w-2 before:rounded-full before:content-['']",
        match
          ? "before:bg-red-brand"
          : "before:bg-transparent before:hover:bg-gray-200 dark:before:hover:bg-gray-300"
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
            <div className="block py-2 text-sm font-bold uppercase text-black dark:text-white lg:text-xs">
              {category.attrs.title}
            </div>
            {category.children.map((doc) => (
              <MenuLink key={doc.slug} to={doc.slug}>
                {doc.attrs.title}
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
  let editUrl = `${repoUrl}/edit/main/docs/${doc.slug}.md`;
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
        <a className="flex items-center gap-1 hover:underline" href={editUrl}>
          Edit
          <svg aria-hidden className="h-4 w-4">
            <use href={`${iconsHref}#edit`} />
          </svg>
        </a>
      </div>
    </div>
  );
}

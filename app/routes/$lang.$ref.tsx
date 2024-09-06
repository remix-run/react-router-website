import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import * as React from "react";
import {
  Form,
  Link,
  NavLink,
  Outlet,
  useLoaderData,
  useLocation,
  useMatches,
  useNavigation,
  matchPath,
  useNavigate,
  useParams,
  useResolvedPath,
} from "@remix-run/react";
import invariant from "tiny-invariant";
import classNames from "classnames";
import {
  getRepoBranches,
  getRepoDocsMenu,
  getRepoTags,
  validateParams,
} from "~/modules/gh-docs/.server";
import type { Doc } from "~/modules/gh-docs/.server";
import iconsHref from "~/icons.svg";
import { DetailsMenu } from "~/modules/details-menu";
import type { MenuDoc } from "~/modules/gh-docs/.server/docs";
import { getLatestVersion } from "~/modules/gh-docs/.server/tags";
import { useColorScheme } from "~/modules/color-scheme/components";

import docsStylesheet from "~/styles/docs.css?url";
import { DocSearch } from "~/modules/docsearch";

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

  let menu = await getRepoDocsMenu(ref, lang);
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

export default function DocsLayout() {
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

function VersionWarning() {
  let { isLatest, branches, currentGitHubRef } = useLoaderData<typeof loader>();

  if (isLatest) return null;

  // Don't want to show release-next in the menu, but we do want to show
  // the branch-warning
  let warning = [...branches, "release-next"].includes(currentGitHubRef)
    ? `Viewing docs for ${currentGitHubRef} branch, not the latest release`
    : `Viewing docs for an older release`;

  return (
    <div className="hidden lg:block">
      <div className="animate-[bounce_500ms_2.5] bg-red-brand p-2 text-xs text-white">
        {warning}.{" "}
        <Link to="/en/main" className="underline">
          View latest
        </Link>
      </div>
    </div>
  );
}

export function Header() {
  let navigate = useNavigate();

  return (
    <div className="relative z-20 flex h-16 w-full items-center justify-between border-b border-gray-50 bg-white px-4 py-3 text-gray-900 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100 lg:px-8">
      <div className="flex w-full items-center justify-between gap-8 md:w-auto">
        <Link
          to="/"
          className="flex items-center gap-1 text-gray-900 dark:text-white"
          onContextMenu={(event) => {
            event.preventDefault();
            navigate("/brand");
          }}
        >
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
        <div className="flex items-center gap-2">
          <VersionSelect />
          <ColorSchemeToggle />
        </div>
      </div>
      <VersionWarning />
      <DocSearchSection />
      <div className="flex items-center gap-4">
        <HeaderSvgLink
          href="https://github.com/remix-run/react-router"
          svgId="github"
          svgLabel="GitHub octocat logo in a circle"
          title="View code on GitHub"
          svgSize="24x24"
        />
        <HeaderSvgLink
          href="https://rmx.as/discord"
          svgId="discord"
          svgLabel="Discord logo in a circle"
          title="Chat on Discord"
          svgSize="24x24"
        />
        <HeaderSvgLink
          href="https://remix.run"
          svgId="remix"
          svgLabel="Stylized text saying “Made by Remix” with an right pointing arrow."
          svgSize="122x17"
        />
      </div>
    </div>
  );
}

function DocSearchSection({ className }: { className?: string }) {
  return (
    <div
      className={classNames(
        "relative w-52 lg:sticky lg:top-0 lg:z-10",
        className
      )}
    >
      <div className="absolute -top-24 hidden h-24 w-full bg-white dark:bg-gray-900 lg:block" />
      <div
        className={classNames(
          "relative lg:bg-white lg:dark:bg-gray-900",
          // This hides some of the underlying text when the user scrolls to the
          // bottom which results in the overscroll bounce
          "before:absolute before:bottom-0 before:left-0 before:-z-10 before:hidden before:h-[200%] before:w-full before:bg-inherit lg:before:block"
        )}
      >
        <DocSearch />
      </div>
    </div>
  );
}

function ColorSchemeToggle() {
  let location = useLocation();

  // This is the same default, hover, focus style as the VersionSelect
  const className =
    "border border-transparent bg-gray-100 hover:bg-gray-200 focus:border focus:border-gray-100 focus:bg-white dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:border-gray-400 dark:focus:bg-gray-700";

  return (
    <DetailsMenu className="relative cursor-pointer">
      <summary
        className={`_no-triangle focus:border-200 flex h-[40px] w-[40px] items-center justify-center rounded-full ${className}`}
      >
        <svg className="hidden h-[24px] w-[24px] dark:inline">
          <use href={`${iconsHref}#moon`} />
        </svg>
        <svg className="h-[24px] w-[24px] dark:hidden">
          <use href={`${iconsHref}#sun`} />
        </svg>
      </summary>
      <DetailsPopup className="w-40">
        <Form replace action="/color-scheme" method="post" preventScrollReset>
          <input
            type="hidden"
            name="returnTo"
            value={location.pathname + location.search}
          />
          <ColorSchemeButton
            svgId="sun"
            label="Light"
            value="light"
            name="colorScheme"
          />
          <ColorSchemeButton
            svgId="moon"
            label="Dark"
            value="dark"
            name="colorScheme"
          />
          <ColorSchemeButton
            svgId="setting"
            label="System"
            value="system"
            name="colorScheme"
          />
        </Form>
      </DetailsPopup>
    </DetailsMenu>
  );
}

let ColorSchemeButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithRef<"button"> & { svgId: string; label: string }
>(({ svgId, label, ...props }, forwardedRef) => {
  let colorScheme = useColorScheme();
  return (
    <button
      {...props}
      ref={forwardedRef}
      disabled={colorScheme === props.value}
      className={classNames(
        "flex w-full items-center gap-4 px-4 py-1",
        colorScheme === props.value
          ? "text-red-brand"
          : "hover:bg-gray-50 active:text-red-brand dark:hover:bg-gray-700 dark:active:text-red-brand"
      )}
    >
      <svg className="h-[18px] w-[18px]">
        <use href={`${iconsHref}#${svgId}`} />
      </svg>{" "}
      {label}
    </button>
  );
});

function HeaderLink({
  children,
  to,
}: {
  children: React.ReactNode;
  to: string;
}) {
  return (
    <Link
      className="p-2 py-2.5 text-sm leading-none text-gray-500 decoration-gray-200 underline-offset-4 hover:underline dark:text-gray-300 dark:decoration-gray-500 md:p-3"
      to={to}
    >
      {children}
    </Link>
  );
}

function HeaderSvgLink({
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
        `hidden text-gray-400 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50 md:block`,
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

function NavTab({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        classNames(
          "-mb-[1px] block rounded-t-xl border border-gray-100 px-3 py-2 font-semibold",
          isActive
            ? "dark:TODO: border-b-white text-red-brand"
            : "border-transparent text-gray-500 hover:border-gray-100 hover:border-b-transparent"
        )
      }
    >
      {children}
    </NavLink>
  );
}

function NavTabs() {
  let params = useParams();
  return (
    <div className="flex justify-center gap-2 border-b border-b-gray-100">
      <NavTab to={`/${params.lang || "en"}/${params.ref}`}>Guides</NavTab>
      <NavTab to={`/api/${params.ref}/react-router`}>Reference</NavTab>
    </div>
  );
}

export function NavMenuDesktop({
  menu,
  pkgs,
}: {
  menu?: MenuDoc[];
  pkgs?: string[];
}) {
  return (
    <div
      className={classNames(
        "sticky bottom-0 top-16 hidden w-[--nav-width] flex-col gap-3 self-start overflow-auto py-6 pl-8 pr-6 lg:flex",
        // Account for the height of the top nav
        "h-[calc(100vh-var(--header-height))]"
      )}
    >
      <NavTabs />
      {pkgs && (
        <select className="rounded-full border">
          {pkgs.map((pkg) => (
            <option key={pkg} value={pkg}>
              {pkg}
            </option>
          ))}
        </select>
      )}

      <div className="[&_*:focus]:scroll-mt-[6rem]">
        <Menu menu={menu} />
      </div>
    </div>
  );
}

function useDoc(): Doc | null {
  let data = useMatches().slice(-1)[0].data;
  if (!data || !(typeof data === "object") || !("doc" in data)) return null;
  return data.doc as Doc;
}

export function NavMenuMobile({ menu }: { menu?: MenuDoc[] }) {
  let doc = useDoc();

  return (
    <DetailsMenu className="relative flex h-full flex-col lg:hidden">
      <summary
        tabIndex={0}
        className="_no-triangle flex cursor-pointer select-none items-center gap-2 border-b border-gray-50 bg-white px-2 py-3 text-sm font-medium hover:bg-gray-50 active:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800 dark:active:bg-gray-700"
      >
        <div className="flex items-center gap-2">
          <svg aria-hidden className="hidden h-5 w-5 group-open:block">
            <use href={`${iconsHref}#chevron-d`} />
          </svg>
          <svg aria-hidden className="h-5 w-5 group-open:hidden">
            <use href={`${iconsHref}#chevron-r`} />
          </svg>
        </div>
        <div className="whitespace-nowrap font-bold">
          {doc ? doc.attrs.title : "Navigation"}
        </div>
      </summary>
      <div className="absolute h-[66vh] w-full overflow-auto overscroll-contain border-b bg-white p-3 shadow-2xl dark:border-gray-700 dark:bg-gray-900 dark:shadow-black">
        <Menu menu={menu} />
      </div>
    </DetailsMenu>
  );
}

function DetailsPopup({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`absolute right-0 z-20 md:left-0 ${className}`}>
      <div className="relative top-1 rounded-lg border border-gray-100 bg-white py-2 shadow-lg dark:border-gray-400 dark:bg-gray-800 ">
        {children}
      </div>
    </div>
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
  } = useLoaderData<typeof loader>();

  // This is the same default, hover, focus style as the ColorScheme trigger
  const className =
    "border border-transparent bg-gray-100 hover:bg-gray-200 focus:border focus:border-gray-100 focus:bg-white dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:border-gray-400 dark:focus:bg-gray-700";

  return (
    <DetailsMenu className="group relative">
      <summary
        className={`_no-triangle relative flex h-[40px] cursor-pointer list-none items-center justify-between gap-3 rounded-full px-3 ${className}`}
      >
        <div>{currentGitHubRef}</div>
        <svg aria-hidden className="h-[18px] w-[18px] text-gray-400">
          <use href={`${iconsHref}#dropdown-arrows`} />
        </svg>
      </summary>
      <DetailsPopup className="w-40">
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
        <VersionLink key={"4/5.x"} to="https://v5.reactrouter.com/">
          v4/5.x
        </VersionLink>
        <VersionLink
          key={"3.x"}
          to="https://github.com/remix-run/react-router/tree/v3.2.6/docs"
        >
          v3.x
        </VersionLink>
      </DetailsPopup>
    </DetailsMenu>
  );
}

function VersionsLabel({ label }: { label: string }) {
  return (
    <div className="px-4 pb-2 pt-2 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-300">
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
  let isExternal = to.startsWith("http");
  let isActive = useIsActivePath(to);
  let className =
    "relative pl-4 group items-center flex py-1 before:mr-4 before:relative before:top-px before:block before:h-1.5 before:w-1.5 before:rounded-full before:content-['']";

  if (isExternal) {
    return (
      <a
        href={to}
        className={classNames(
          className,
          "after:absolute after:right-4 after:top-1 after:block after:-rotate-45 after:opacity-50 after:content-['→']",
          // Same as !isActive styles on <Link> below
          "hover:bg-gray-50 active:text-red-brand dark:text-gray-200 dark:hover:bg-gray-700 dark:active:text-red-brand"
        )}
      >
        {children}
      </a>
    );
  }

  return to ? (
    <Link
      className={classNames(
        className,
        "before:bg-transparent",
        isActive
          ? "text-red-brand"
          : "hover:bg-gray-50 active:text-red-brand dark:text-gray-200 dark:hover:bg-gray-700 dark:active:text-red-brand"
      )}
      to={to}
    >
      {children}
    </Link>
  ) : (
    <span
      className={classNames(
        className,
        "font-bold text-red-brand before:bg-red-brand"
      )}
    >
      {children}
    </span>
  );
}

function useIsActivePath(_to: string | string[]) {
  let navigation = useNavigation();
  let currentLocation = useLocation();
  let tos = Array.isArray(_to) ? _to : [_to];
  let matched = false;
  for (let to of tos) {
    // TODO: This is against the rules but the menu is static.
    let { pathname } = useResolvedPath(to);
    let location =
      navigation.location && !navigation.formData
        ? navigation.location
        : currentLocation;
    let match = matchPath(pathname + "/*", location.pathname);
    matched = matched || Boolean(match);
  }
  return matched;
}

function MenuLink({ to, children }: { to: string; children: React.ReactNode }) {
  let isActive = useIsActivePath(to);

  return (
    <Link
      prefetch="intent"
      to={to}
      className={classNames(
        // link styles
        "group my-1 flex items-center rounded-md border-transparent py-1.5 pl-4 lg:text-sm",
        isActive
          ? "bg-gray-50 font-semibold text-red-brand dark:bg-gray-800"
          : "text-gray-400 hover:text-gray-900 active:text-red-brand dark:text-gray-400 dark:hover:text-gray-50 dark:active:text-red-brand"
      )}
      children={children}
    />
  );
}

function MenuCategory({ category }: { category: MenuDoc }) {
  const menuCategoryType = category.hasContent
    ? category.children.length > 0
      ? "linkAndDetails"
      : "link"
    : "details";

  if (menuCategoryType === "link") {
    return (
      <MenuSummary as="div">
        <MenuCategoryLink to={category.slug!}>
          {category.attrs.title}
        </MenuCategoryLink>
      </MenuSummary>
    );
  }

  return (
    <MenuCategoryDetails
      className="group"
      slug={category.slug}
      slugs={category.slugs}
    >
      <MenuSummary>
        {menuCategoryType === "linkAndDetails" ? (
          <MenuCategoryLink to={category.slug!}>
            {category.attrs.title}
          </MenuCategoryLink>
        ) : (
          category.attrs.title
        )}
        <svg aria-hidden className="hidden h-5 w-5 group-open:block">
          <use href={`${iconsHref}#chevron-d`} />
        </svg>
        <svg aria-hidden className="h-5 w-5 group-open:hidden">
          <use href={`${iconsHref}#chevron-r`} />
        </svg>
      </MenuSummary>
      <ul>
        {category.children.map((doc, index) => (
          <li key={index}>
            {doc.children.length > 0 ? (
              <div className="pl-4">
                <MenuCategory category={doc} />
              </div>
            ) : (
              <MenuLink key={index} to={doc.slug!}>
                {doc.attrs.title} {doc.attrs.new && "🆕"}
              </MenuLink>
            )}
          </li>
        ))}
      </ul>
    </MenuCategoryDetails>
  );
}

// Updated Menu component
function Menu({ menu }: { menu?: MenuDoc[] }) {
  return menu ? (
    <nav>
      <ul>
        {menu.map((category) => (
          <li key={category.attrs.title} className="mb-3">
            <MenuCategory category={category} />
          </li>
        ))}
      </ul>
    </nav>
  ) : (
    <div className="bold text-gray-300 dark:text-gray-400">
      Failed to load menu
    </div>
  );
}

type MenuCategoryDetailsType = {
  className?: string;
  slug?: string;
  slugs?: string[];
  children: React.ReactNode;
  onOpenChanged?: (isOpen: boolean) => void;
};

function MenuCategoryDetails({
  className,
  slug,
  slugs,
  children,
}: MenuCategoryDetailsType) {
  const isActivePath = useIsActivePath(slugs ?? slug ?? []);
  // By default only the active path is open
  const [isOpen, setIsOpen] = React.useState(true);

  // Auto open the details element, useful when navigating from the home page
  React.useEffect(() => {
    if (isActivePath) {
      setIsOpen(true);
    }
  }, [isActivePath]);

  return (
    <details
      className={classNames(className, "relative flex cursor-pointer flex-col")}
      open={isOpen}
      onToggle={(e) => {
        // Synchronize the DOM's state with React state to prevent the
        // details element from being closed after navigation and re-evaluation
        // of useIsActivePath
        setIsOpen(e.currentTarget.open);
      }}
    >
      {children}
    </details>
  );
}

// This components attempts to keep all of the styles as similar as possible
function MenuSummary({
  children,
  as = "summary",
}: {
  children: React.ReactNode;
  as?: "summary" | "div";
}) {
  // "-mx-4 pl-4",

  const sharedClassName =
    "-mx-4 rounded-md px-3 py-3 transition-colors duration-100";
  const wrappedChildren = (
    <div className="flex h-5 w-full items-center justify-between font-bold lg:text-sm">
      {children}
    </div>
  );

  if (as === "summary") {
    return (
      <summary
        className={classNames(
          sharedClassName,
          "_no-triangle block select-none",
          "outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-brand  dark:focus-visible:ring-gray-100",
          "hover:bg-gray-50 active:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800 dark:active:bg-gray-700"
        )}
      >
        {wrappedChildren}
      </summary>
    );
  }

  return (
    <div
      className={classNames(
        sharedClassName,
        "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-inset has-[:focus-visible]:ring-red-brand dark:has-[:focus-visible]:ring-gray-100"
      )}
    >
      {wrappedChildren}
    </div>
  );
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
        "outline-none focus:outline-none focus-visible:text-red-brand dark:focus-visible:text-red-400",
        isActive
          ? "text-red-brand"
          : "hover:text-red-brand dark:hover:text-red-400 "
      )}
    >
      {children}
    </Link>
  );
}

export function Footer() {
  return (
    <div className="flex justify-between gap-4 border-t border-t-gray-50 py-4 text-sm text-gray-400 dark:border-gray-800">
      <div className="lg:flex lg:items-center">
        <div className="pr-4">
          &copy;{" "}
          <a className="hover:underline" href="https://remix.run">
            Remix Software, Inc.
          </a>
        </div>
        <div className="hidden lg:block">•</div>
        <div className="pr-4 lg:pl-4">
          <Link className="hover:underline" to="/brand">
            Brand
          </Link>
        </div>
        <div className="hidden lg:block">•</div>
        <div className="pr-4 lg:pl-4">
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
        <EditLink />
      </div>
    </div>
  );
}

function EditLink() {
  let doc = useDoc();
  let params = useParams();
  let isEditableRef = params.ref === "main" || params.ref === "dev";

  if (!doc || !isEditableRef || !doc.filename) {
    return null;
  }

  let editUrl: string;
  let repoUrl = "https://github.com/remix-run/react-router";
  if (doc.filename.match(/\.tsx?$/)) {
    editUrl = `${repoUrl}/edit/${params.ref}/${doc.filename}`;
  } else {
    // TODO: deal with translations when we add them with params.lang
    editUrl = `${repoUrl}/edit/${params.ref}/${doc.slug}.md`;
  }

  return (
    <a className="flex items-center gap-1 hover:underline" href={editUrl}>
      Edit
      <svg aria-hidden className="h-4 w-4">
        <use href={`${iconsHref}#edit`} />
      </svg>
    </a>
  );
}

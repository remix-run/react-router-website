import iconsHref from "~/icons.svg";
import { DetailsMenu } from "~/modules/details-menu";
import { DetailsPopup } from "./details-popup";
import { PopupLabel } from "./popup-label";
import { Link, unstable_useRouterState as useRouterState } from "react-router";
import { clsx } from "clsx";
import { useHeaderData } from "./docs-header/use-header-data";
import { useNavState } from "~/hooks/use-nav-state";

export function VersionSelect() {
  let {
    versions,
    latestVersion,
    branches,
    currentGitHubRef,
    isLatest,
    refParam,
  } = useHeaderData();
  let { "*": splat } = useRouterState().active.params;

  // Strip the URL ref segment (e.g. "main", "7.15.1") off the splat so we can
  // re-prefix it with a different ref when the user picks one.
  let slug = splat ? stripLeadingRef(splat, refParam) : "";

  // This is the same default, hover, focus style as the ColorScheme trigger
  const className =
    "border border-transparent bg-gray-100 hover:bg-gray-200 focus:border focus:border-gray-100 focus:bg-white dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:border-gray-400 dark:focus:bg-gray-700";

  let label = isLatest ? "latest" : currentGitHubRef;
  return (
    <DetailsMenu className="group relative">
      <summary
        title={label}
        className={clsx(
          `_no-triangle relative flex h-[40px] w-24 cursor-pointer list-none items-center justify-between gap-3 overflow-hidden whitespace-nowrap rounded-full px-3`,
          className,
        )}
      >
        <div>{label}</div>
        <svg aria-hidden className="h-[18px] w-[18px] text-gray-400">
          <use href={`${iconsHref}#dropdown-arrows`} />
        </svg>
      </summary>
      <DetailsPopup className="w-[12rem]">
        <PopupLabel label="Current" />
        <RefLink to={slug ? `/${slug}` : "/home"}>
          latest ({latestVersion})
        </RefLink>
        <RefLink to={`/main/${slug || "home"}`}>main (unreleased)</RefLink>
        {branches.includes("local") ? (
          <RefLink to={`/local/${slug || "home"}`}>local</RefLink>
        ) : null}
        <PopupLabel label="Versions" />
        {versions.map((version) => (
          <RefLink
            key={version}
            to={version.startsWith("7") ? `/${version}/home` : `/${version}`}
          >
            {version}
          </RefLink>
        ))}
        <RefLink key={"4/5.x"} to="https://v5.reactrouter.com/">
          v4/5.x
        </RefLink>
        <RefLink
          key={"3.x"}
          to="https://github.com/remix-run/react-router/tree/v3.2.6/docs"
        >
          v3.x
        </RefLink>
      </DetailsPopup>
    </DetailsMenu>
  );
}

function stripLeadingRef(splat: string, refParam: string | undefined) {
  if (!refParam) return splat;
  if (splat === refParam) return "";

  let prefix = `${refParam}/`;
  return splat.startsWith(prefix) ? splat.slice(prefix.length) : splat;
}

function RefLink({ to, children }: { to: string; children: React.ReactNode }) {
  let isExternal = to.startsWith("http");
  let { isActive } = useNavState(to);
  let className =
    "relative pl-4 group items-center flex py-1 before:mr-4 before:relative before:top-px before:block before:h-1.5 before:w-1.5 before:rounded-full before:content-['']";

  if (isExternal) {
    return (
      <a
        href={to}
        className={clsx(
          className,
          "after:absolute after:right-4 after:top-1 after:block after:-rotate-45 after:opacity-50 after:content-['→']",
          // Same as !isActive styles on <Link> below
          "hover:bg-gray-50 active:text-red-brand dark:text-gray-200 dark:hover:bg-gray-700 dark:active:text-red-brand",
        )}
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      className={clsx(
        className,
        isActive
          ? "font-bold text-red-brand before:bg-red-brand"
          : "before:bg-transparent hover:bg-gray-50 active:text-red-brand dark:text-gray-200 dark:hover:bg-gray-700 dark:active:text-red-brand",
      )}
      to={to}
    >
      {children}
    </Link>
  );
}

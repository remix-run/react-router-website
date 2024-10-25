import iconsHref from "~/icons.svg";
import { DetailsMenu } from "~/modules/details-menu";
import { DetailsPopup } from "./details-popup";
import { PopupLabel } from "./popup-label";
import { Link } from "@remix-run/react";
import classNames from "classnames";
import { useHeaderData } from "./docs-header/use-header-data";
import { useDocLayoutId } from "./use-doc-layout-id";
import { useNavigation } from "~/hooks/use-navigation";

export function VersionSelect({
  // whether or not to show the guides/api links for pre/post v7
  independent,
}: {
  independent?: boolean;
}) {
  let { versions, latestVersion, releaseBranch, branches, currentGitHubRef } =
    useHeaderData();

  // This is the same default, hover, focus style as the ColorScheme trigger
  const className =
    "border border-transparent bg-gray-100 hover:bg-gray-200 focus:border focus:border-gray-100 focus:bg-white dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:border-gray-400 dark:focus:bg-gray-700";

  let label = currentGitHubRef === releaseBranch ? "latest" : currentGitHubRef;
  return (
    <DetailsMenu className="group relative">
      <summary
        title={label}
        className={classNames(
          `_no-triangle relative flex h-[40px] w-24 cursor-pointer list-none items-center justify-between gap-3 overflow-hidden whitespace-nowrap px-3`,
          className,
          independent ? "rounded-full" : "rounded-l-full"
        )}
      >
        <div>{label}</div>
        <svg aria-hidden className="h-[18px] w-[18px] text-gray-400">
          <use href={`${iconsHref}#dropdown-arrows`} />
        </svg>
      </summary>
      <DetailsPopup className="w-40">
        <PopupLabel label="Branches" />
        <MainLink latestVersion={latestVersion} />
        <DevLink />
        {branches.includes("local") && <LocalLink />}

        <PopupLabel label="Versions" />
        {versions.map((version) => (
          <VersionLink key={version} version={version} />
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

function useLayoutSegment() {
  let layoutId = useDocLayoutId();
  return layoutId === "api" ? "api" : "guides";
}

function MainLink({ latestVersion }: { latestVersion: string }) {
  let layoutSegment = useLayoutSegment();
  let isV7Link = latestVersion.startsWith("7");
  let to = isV7Link ? `/${layoutSegment}` : "/en/main";
  return <RefLink to={to}>latest ({latestVersion})</RefLink>;
}

function DevLink() {
  let layoutSegment = useLayoutSegment();
  return <RefLink to={`/dev/${layoutSegment}`}>dev</RefLink>;
}

function LocalLink() {
  let layoutId = useDocLayoutId();
  return <RefLink to={`/local/${layoutId}`}>local</RefLink>;
}

function VersionLink({ version }: { version: string }) {
  let layoutSegment = useLayoutSegment();
  let isV7 = version.startsWith("7");
  let to = isV7 ? `/${layoutSegment}` : `/en/${version}`;
  return <RefLink to={to}>{version}</RefLink>;
}

function RefLink({ to, children }: { to: string; children: React.ReactNode }) {
  let isExternal = to.startsWith("http");
  let { isActive } = useNavigation(to);
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

  return (
    <Link
      className={classNames(
        className,
        isActive
          ? "font-bold text-red-brand before:bg-red-brand"
          : "before:bg-transparent hover:bg-gray-50 active:text-red-brand dark:text-gray-200 dark:hover:bg-gray-700 dark:active:text-red-brand"
      )}
      to={to}
    >
      {children}
    </Link>
  );
}

import iconsHref from "~/icons.svg";
import { DetailsMenu } from "~/modules/details-menu";
import { DetailsPopup } from "./details-popup";
import { PopupLabel } from "./popup-label";
import { Link, useParams } from "react-router";
import classNames from "classnames";
import { useHeaderData } from "./docs-header/use-header-data";
import { useNavigation } from "~/hooks/use-navigation";

export function VersionSelect() {
  let { versions, latestVersion, releaseBranch, branches, currentGitHubRef } =
    useHeaderData();
  let { "*": splat } = useParams();

  let slug = "";
  if (splat && !currentGitHubRef.startsWith("6")) {
    slug = splat?.replace(new RegExp(`^${currentGitHubRef}/`), "");
  }

  // This is the same default, hover, focus style as the ColorScheme trigger
  const className =
    "border border-transparent bg-gray-100 hover:bg-gray-200 focus:border focus:border-gray-100 focus:bg-white dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:border-gray-400 dark:focus:bg-gray-700";

  let label = currentGitHubRef === releaseBranch ? "latest" : currentGitHubRef;
  return (
    <DetailsMenu className="group relative">
      <summary
        title={label}
        className={classNames(
          `_no-triangle relative flex h-[40px] w-24 cursor-pointer list-none items-center justify-between gap-3 overflow-hidden whitespace-nowrap rounded-full px-3`,
          className,
        )}
      >
        <div>{label}</div>
        <svg aria-hidden className="h-[18px] w-[18px] text-gray-400">
          <use href={`${iconsHref}#dropdown-arrows`} />
        </svg>
      </summary>
      <DetailsPopup className="w-40">
        <PopupLabel label="Branches" />
        <MainLink latestVersion={latestVersion} slug={slug} />
        <DevLink slug={slug} />
        {branches.includes("local") && <LocalLink slug={slug} />}

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

function MainLink({
  latestVersion,
  slug,
}: {
  latestVersion: string;
  slug: string;
}) {
  let to = slug || "/home";
  return <RefLink to={to}>latest ({latestVersion})</RefLink>;
}

function DevLink({ slug }: { slug: string }) {
  return <RefLink to={`/dev/${slug}`}>dev</RefLink>;
}

function LocalLink({ slug }: { slug: string }) {
  return <RefLink to={`/local/${slug}`}>local</RefLink>;
}

function VersionLink({ version }: { version: string }) {
  let isV7 = version.startsWith("7");
  let to = isV7 ? `/${version}/home` : `/${version}`;
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
          "hover:bg-gray-50 active:text-red-brand dark:text-gray-200 dark:hover:bg-gray-700 dark:active:text-red-brand",
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
          : "before:bg-transparent hover:bg-gray-50 active:text-red-brand dark:text-gray-200 dark:hover:bg-gray-700 dark:active:text-red-brand",
      )}
      to={to}
    >
      {children}
    </Link>
  );
}

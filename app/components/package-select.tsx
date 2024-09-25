import classNames from "classnames";
import { Link, useLoaderData, useParams } from "@remix-run/react";
import invariant from "tiny-invariant";
import { type SerializeFrom } from "@remix-run/node";
import iconsHref from "~/icons.svg";
import { DetailsMenu } from "~/modules/details-menu";
import { DetailsPopup } from "./details-popup";
import { PopupLabel } from "./popup-label";
import { type loadPackageNames } from "~/components/docs-menu/data.server";

type Pkg = Awaited<SerializeFrom<ReturnType<typeof loadPackageNames>>>;

export function PackageSelect() {
  let { pkgs } = useLoaderData() as { pkgs: Pkg };
  invariant(pkgs, "Expected loaderData.pkgs");

  let { pkg } = useParams();
  invariant(pkg, "Expected params.pkg");
  let pkgName = pkg === "react-router" ? pkg : `@react-router/${pkg}`;

  return (
    <DetailsMenu className="relative">
      <summary className="_no-triangle relative flex cursor-pointer list-none items-center justify-between gap-3 rounded-full border border-gray-100 px-3 py-1 dark:border-gray-600">
        <span>{pkgName}</span>
        <svg aria-hidden className="h-[18px] w-[18px] text-gray-400">
          <use href={`${iconsHref}#dropdown-arrows`} />
        </svg>
      </summary>
      <DetailsPopup>
        <div className="my-2">
          <PopupLabel label="Select a package" />
          {pkgs.map((p) => (
            <PackageLink
              key={p.href}
              href={p.href}
              name={p.name}
              active={p.href === pkg}
            />
          ))}
        </div>
      </DetailsPopup>
    </DetailsMenu>
  );
}

function PackageLink({
  name,
  href,
  active,
}: {
  name: string;
  href: string;
  active: boolean;
}) {
  let className =
    "relative pl-4 group items-center flex py-1 before:mr-4 before:relative before:top-px before:block before:h-1.5 before:w-1.5 before:rounded-full before:content-['']";
  return active ? (
    <span
      className={classNames(
        className,
        "font-bold text-red-brand before:bg-red-brand"
      )}
    >
      {name}
    </span>
  ) : (
    <Link
      to={`../${href}`}
      relative="path"
      className={classNames(
        className,
        "hover:bg-gray-50 active:text-red-brand dark:text-gray-200 dark:hover:bg-gray-700 dark:active:text-red-brand"
      )}
    >
      {name}
    </Link>
  );
}

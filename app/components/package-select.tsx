import iconsHref from "~/icons.svg";
import { DetailsMenu } from "~/modules/details-menu";
import { DetailsPopup } from "./details-popup";
import { PopupLabel } from "./popup-label";
import classNames from "classnames";
import { Link } from "@remix-run/react";

export function PackageSelect({
  pkgs,
  value,
}: {
  pkgs: string[];
  value?: string;
}) {
  return (
    <DetailsMenu className="relative cursor-pointer">
      <summary className="relative flex cursor-pointer list-none items-center justify-between gap-3 border border-gray-100 px-3 py-1">
        <span>{value}</span>
        <svg aria-hidden className="h-[18px] w-[18px] text-gray-400">
          <use href={`${iconsHref}#dropdown-arrows`} />
        </svg>
      </summary>
      <DetailsPopup>
        <div className="my-2">
          <PopupLabel label="Select a package" />
          {pkgs.map((pkg) => (
            <PackageLink key={pkg} pkg={pkg} active={pkg === value} />
          ))}
        </div>
      </DetailsPopup>
    </DetailsMenu>
  );
}

function PackageLink({ pkg, active }: { pkg: string; active: boolean }) {
  let className =
    "relative pl-4 group items-center flex py-1 before:mr-4 before:relative before:top-px before:block before:h-1.5 before:w-1.5 before:rounded-full before:content-['']";
  return active ? (
    <span
      className={classNames(
        className,
        "font-bold text-red-brand before:bg-red-brand"
      )}
    >
      {pkg}
    </span>
  ) : (
    <Link
      to={pkg}
      className={classNames(
        className,
        "hover:bg-gray-50 active:text-red-brand dark:text-gray-200 dark:hover:bg-gray-700 dark:active:text-red-brand"
      )}
    >
      {pkg}
    </Link>
  );
}

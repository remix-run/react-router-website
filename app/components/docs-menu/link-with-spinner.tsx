"use client";

import { Link } from "react-router";
import { clsx } from "clsx";
import { useNavState } from "~/hooks/use-nav-state";
import { useDelayedValue } from "~/hooks/use-delayed-value";
import iconsHref from "~/icons.svg";

export function LinkWithSpinner({
  to,
  children,
  header = false,
}: {
  to: string;
  children: React.ReactNode;
  header?: boolean;
}) {
  let { isActive, isPending } = useNavState(to);
  let slowNav = useDelayedValue(isPending);

  return (
    <Link
      prefetch="intent"
      to={to}
      className={clsx(
        header
          ? "relative -mx-4 flex items-center justify-between rounded-md px-4 py-3 font-bold"
          : "relative -mx-2 flex items-center justify-between rounded-md py-1.5 pl-4 pr-3 lg:text-sm",
        isActive
          ? "bg-gray-50 font-semibold text-red-brand dark:bg-gray-800"
          : header
            ? "hover:bg-gray-50 active:text-red-brand dark:hover:bg-gray-800 dark:active:text-red-brand"
            : "text-gray-400 hover:text-gray-800 active:text-red-brand dark:text-gray-400 dark:hover:text-gray-50 dark:active:text-red-brand",
      )}
    >
      {children}
      {slowNav && !isActive && (
        <svg
          aria-hidden
          className="absolute -left-1 h-4 w-4 animate-spin lg:-left-2"
        >
          <use href={`${iconsHref}#arrow-path`} />
        </svg>
      )}
    </Link>
  );
}

import * as React from "react";
import { Link, useLoaderData } from "@remix-run/react";
import classNames from "classnames";

import iconsHref from "~/icons.svg";

import type { MenuDoc } from "~/modules/gh-docs/.server/docs";
import type { DocsMenu, ReferenceMenu } from "./data.server";
import invariant from "tiny-invariant";
import { useNavigation } from "~/hooks/use-navigation";
import { useDelayedValue } from "~/hooks/use-delayed-value";

export function useMenuData() {
  let { menu } = useLoaderData() as { menu: DocsMenu | ReferenceMenu };
  invariant(menu, "Expected `menu` in loader data");
  return menu;
}

export function Menu({ open }: { open: boolean }) {
  let menu = useMenuData();

  // github might be down but the menu but the doc could be cached in memory, so
  // prevent the whole page from blowing up and still render the doc
  if (!menu) {
    <div className="bold text-gray-300 dark:text-gray-400">
      Failed to load menu
    </div>;
  }

  return (
    <nav>
      {menu.map((category, index) => (
        <div key={category.attrs.title} className="mb-3">
          <MenuCategory category={category} open={open} />
        </div>
      ))}
    </nav>
  );
}

function MenuCategory({
  category,
  open = false,
}: {
  category: MenuDoc;
  open?: boolean;
}) {
  return (
    <MenuCategoryDetails className="group" open={open}>
      <MenuSummary>
        {category.attrs.title}
        <svg aria-hidden className="hidden h-5 w-5 group-open:block">
          <use href={`${iconsHref}#chevron-d`} />
        </svg>
        <svg aria-hidden className="h-5 w-5 group-open:hidden">
          <use href={`${iconsHref}#chevron-r`} />
        </svg>
      </MenuSummary>

      {category.children.sort(sortDocs).map((doc, index) => (
        <React.Fragment key={index}>
          {doc.children.length > 0 ? (
            <>
              <MenuHeading label={doc.attrs.title} />
              {doc.children.sort(sortDocs).map((doc, index) => (
                <MenuLink key={index} to={doc.slug!}>
                  {doc.attrs.title} {doc.attrs.new && "🆕"}
                </MenuLink>
              ))}
            </>
          ) : (
            <MenuLink key={index} to={doc.slug!}>
              {doc.attrs.title} {doc.attrs.new && "🆕"}
            </MenuLink>
          )}
        </React.Fragment>
      ))}
    </MenuCategoryDetails>
  );
}

function MenuHeading({ label }: { label: string }) {
  return (
    <div className="mx-2 mt-3 pb-2 pt-2 text-xs font-bold uppercase tracking-wider">
      {label}
    </div>
  );
}

type MenuCategoryDetailsType = {
  className?: string;
  slug?: string;
  slugs?: string[];
  children: React.ReactNode;
  onOpenChanged?: (isOpen: boolean) => void;
  open?: boolean;
};

function MenuCategoryDetails({
  className,
  children,
  open,
}: MenuCategoryDetailsType) {
  return (
    <details
      className={classNames(className, "relative flex flex-col")}
      open={open}
    >
      {children}
    </details>
  );
}

let sortDocs = (a: MenuDoc, b: MenuDoc) =>
  (a.attrs.order || Infinity) - (b.attrs.order || Infinity);

// This components attempts to keep all of the styles as similar as possible
function MenuSummary({ children }: { children: React.ReactNode }) {
  const sharedClassName =
    // -mx-4 so there's some nice padding on the hover but the text still lines up
    "-mx-4 rounded-md px-4 py-3 transition-colors duration-100";

  return (
    <summary
      className={classNames(
        sharedClassName,
        "_no-triangle my-1 block cursor-pointer select-none",
        "outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-brand  dark:focus-visible:ring-gray-100",
        "hover:bg-gray-50 active:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800 dark:active:bg-gray-700"
      )}
    >
      <div className="flex h-5 w-full items-center justify-between font-bold">
        {children}
      </div>
    </summary>
  );
}

function MenuLink({ to, children }: { to: string; children: React.ReactNode }) {
  let { isActive, isPending } = useNavigation(to);
  let slowNav = useDelayedValue(isPending);

  return (
    <Link
      prefetch="intent"
      to={to}
      className={classNames(
        "group relative flex items-center justify-between rounded-md border-transparent px-2 py-1.5 lg:text-sm",
        isActive
          ? "bg-gray-50 font-semibold text-red-brand dark:bg-gray-800"
          : "text-gray-400 hover:text-gray-800 active:text-red-brand dark:text-gray-400 dark:hover:text-gray-50 dark:active:text-red-brand"
      )}
    >
      {children}
      {slowNav && !isActive && (
        <svg
          aria-hidden
          className="absolute -left-3 hidden h-4 w-4 animate-spin group-open:block"
        >
          <use href={`${iconsHref}#arrow-path`} />
        </svg>
      )}
    </Link>
  );
}

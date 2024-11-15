import * as React from "react";
import { Link, useLoaderData } from "react-router";
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

export function Menu() {
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
      {menu.map((category) => (
        <div key={category.attrs.title}>
          <MenuCategory category={category} />
        </div>
      ))}
    </nav>
  );
}

function MenuCategory({ category }: { category: MenuDoc }) {
  return (
    <MenuCategoryDetails className="group" slug={category.slug}>
      <MenuSummary>
        {category.attrs.title}
        <svg aria-hidden className="hidden h-5 w-5 group-open:block">
          <use href={`${iconsHref}#chevron-d`} />
        </svg>
        <svg aria-hidden className="h-5 w-5 group-open:hidden">
          <use href={`${iconsHref}#chevron-r`} />
        </svg>
      </MenuSummary>

      <div className="mb-2">
        {category.children.sort(sortDocs).map((doc, index) => (
          <React.Fragment key={index}>
            {doc.children.length > 0 ? (
              <div className="mb-2 ml-2">
                <MenuHeading label={doc.attrs.title} />
                {doc.children.sort(sortDocs).map((doc, index) => (
                  <MenuLink key={index} to={doc.slug!}>
                    {doc.attrs.title} {doc.attrs.new && "🆕"}
                  </MenuLink>
                ))}
              </div>
            ) : (
              <MenuLink key={index} to={doc.slug!}>
                {doc.attrs.title} {doc.attrs.new && "🆕"}
              </MenuLink>
            )}
          </React.Fragment>
        ))}
      </div>
    </MenuCategoryDetails>
  );
}

function MenuHeading({ label }: { label: string }) {
  return (
    <div className="pb-2 pt-2 text-xs font-bold uppercase tracking-wider">
      {label}
    </div>
  );
}

type MenuCategoryDetailsType = {
  className?: string;
  slug?: string;
  children: React.ReactNode;
};

function MenuCategoryDetails({
  className,
  slug,
  children,
}: MenuCategoryDetailsType) {
  let { isActive } = useNavigation(slug);
  // By default only the active path is open
  const [isOpen, setIsOpen] = React.useState(true);

  // Auto open the details element, necessary when navigating from the index page
  React.useEffect(() => {
    if (isActive) {
      setIsOpen(true);
    }
  }, [isActive]);

  return (
    <details
      className={classNames(className, "relative flex flex-col")}
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
        "_no-triangle block cursor-pointer select-none",
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
        "group relative -mx-2 flex items-center justify-between rounded-md border-transparent px-4 py-1.5 lg:text-sm",
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

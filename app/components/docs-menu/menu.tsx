import * as React from "react";
import { Link, useLoaderData } from "@remix-run/react";
import classNames from "classnames";

import { useIsActivePath } from "~/hooks/use-is-active-path";
import iconsHref from "~/icons.svg";

import type { MenuDoc } from "~/modules/gh-docs/.server/docs";
import type { GuidesMenu, ReferenceMenu } from "./data.server";
import invariant from "tiny-invariant";

export function useMenuData() {
  let { menu } = useLoaderData() as { menu: GuidesMenu | ReferenceMenu };
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
      <ul>
        {menu.map((category) => (
          <li key={category.attrs.title} className="mb-3">
            <MenuCategory category={category} />
          </li>
        ))}
      </ul>
    </nav>
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
  const sharedClassName =
    // -mx-4 so there's some nice padding on the hover but the text still lines up
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

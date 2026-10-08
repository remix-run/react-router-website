import * as React from "react";
import { clsx } from "clsx";

import iconsHref from "~/icons.svg";

import type { MenuDoc } from "~/modules/gh-docs/.server/docs";
import { LinkWithSpinner } from "./link-with-spinner";

export function renderMenu({
  menu,
  changelogHref,
  prefix,
}: {
  menu?: MenuDoc[];
  changelogHref?: string;
  prefix: string;
}) {
  // github might be down but the menu but the doc could be cached in memory, so
  // prevent the whole page from blowing up and still render the doc
  if (menu === undefined) {
    return (
      <div className="bold text-gray-300 dark:text-gray-400">
        Failed to load menu
      </div>
    );
  }

  return (
    <nav>
      {changelogHref ? (
        <HeaderMenuLink to={changelogHref}>Changelog</HeaderMenuLink>
      ) : null}
      {menu.map((category) => (
        <div key={category.attrs.title}>
          <MenuCategory category={category} prefix={prefix} />
        </div>
      ))}
    </nav>
  );
}

function MenuCategory({
  category,
  prefix,
}: {
  category: MenuDoc;
  prefix: string;
}) {
  if (category.children.length === 0) {
    return <MenuLink prefix={prefix} doc={category} />;
  }

  return (
    <MenuCategoryDetails className="group">
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
        {[...category.children].sort(sortDocs).map((doc, index) => (
          <React.Fragment key={index}>
            {doc.children.length > 0 ? (
              <div className="mb-2 ml-2">
                <MenuHeading label={doc.attrs.title} />
                {[...doc.children].sort(sortDocs).map((doc, index) => (
                  <MenuLink key={index} prefix={prefix} doc={doc} />
                ))}
              </div>
            ) : (
              <MenuLink key={index} prefix={prefix} doc={doc} />
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
  children: React.ReactNode;
};

function MenuCategoryDetails({ className, children }: MenuCategoryDetailsType) {
  return (
    <details className={clsx(className, "relative flex flex-col")} open>
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
      className={clsx(
        sharedClassName,
        "_no-triangle block cursor-pointer select-none",
        "outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-brand dark:focus-visible:ring-gray-100",
        "hover:bg-gray-50 active:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-800 dark:active:bg-gray-700",
      )}
    >
      <div className="flex h-5 w-full items-center justify-between font-bold">
        {children}
      </div>
    </summary>
  );
}

function HeaderMenuLink({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) {
  return (
    <LinkWithSpinner to={to} header>
      {children}
    </LinkWithSpinner>
  );
}

function MenuLink({ prefix, doc }: { prefix: string; doc: MenuDoc }) {
  return (
    <LinkWithSpinner to={prefix + doc.slug}>
      {doc.attrs.title}
      {doc.attrs.new ? <span title="New API">🆕</span> : null}
      {doc.attrs.unstable ? <span title="Unstable API">🧪</span> : null}
    </LinkWithSpinner>
  );
}

import { type SerializeFrom } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { type Doc } from "~/modules/gh-docs/.server";
import iconsHref from "~/icons.svg";

export function LargeOnThisPage({ doc }: { doc: SerializeFrom<Doc> }) {
  return (
    <div className="sticky top-36 order-1 mt-20 hidden max-h-[calc(100vh-9rem)] w-56 min-w-min flex-shrink-0 self-start overflow-y-auto pb-10 xl:block">
      <nav className="mb-3 flex items-center font-semibold">On this page</nav>
      <ul className="md-toc flex flex-col flex-wrap gap-3 leading-[1.125]">
        {doc.headings.map((heading, i) => (
          <li
            key={i}
            className={heading.headingLevel === "h2" ? "ml-0" : "ml-4"}
          >
            <Link
              to={`#${heading.slug}`}
              dangerouslySetInnerHTML={{
                __html: heading.html || "",
              }}
              className="block py-1 text-sm text-gray-400 hover:text-gray-900 active:text-red-brand dark:text-gray-400 dark:hover:text-gray-50 dark:active:text-red-brand"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SmallOnThisPage({ doc }: { doc: SerializeFrom<Doc> }) {
  return (
    <details className="group flex flex-col lg:mt-4 xl:hidden">
      <summary className="_no-triangle flex cursor-pointer select-none items-center gap-2 border-b border-gray-50 bg-white px-2 py-3 text-sm font-medium hover:bg-gray-50 active:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800 dark:active:bg-gray-700">
        <div className="flex items-center gap-2">
          <svg aria-hidden className="h-5 w-5 group-open:hidden">
            <use href={`${iconsHref}#chevron-r`} />
          </svg>
          <svg aria-hidden className="hidden h-5 w-5 group-open:block">
            <use href={`${iconsHref}#chevron-d`} />
          </svg>
        </div>
        <div className="whitespace-nowrap">On this page</div>
      </summary>
      <ul className="pl-9">
        {doc.headings.map((heading, i) => (
          <li
            key={i}
            className={heading.headingLevel === "h2" ? "ml-0" : "ml-4"}
          >
            <Link
              to={`#${heading.slug}`}
              dangerouslySetInnerHTML={{ __html: heading.html || "" }}
              className="block py-2 text-sm text-gray-400 hover:text-gray-900 active:text-red-brand dark:text-gray-400 dark:hover:text-gray-50 dark:active:text-red-brand"
            />
          </li>
        ))}
      </ul>
    </details>
  );
}

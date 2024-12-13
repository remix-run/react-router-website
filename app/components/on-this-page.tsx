import { Link } from "react-router";
import type { Doc } from "~/modules/gh-docs/.server";
import iconsHref from "~/icons.svg";
import { useEffect, useRef, useState } from "react";
import classNames from "classnames";

export function LargeOnThisPage({
  doc,
  mdRef,
}: {
  doc: Doc;
  mdRef: React.RefObject<HTMLDivElement>;
}) {
  const navRef = useRef<HTMLDivElement>(null);
  const [activeHeading, setActiveHeading] = useState("");

  useEffect(() => {
    const node = mdRef.current;
    if (!node) return;

    const h2 = Array.from(node.querySelectorAll("h2"));
    const h3 = Array.from(node.querySelectorAll("h3"));

    const combinedHeadings = [...h2, ...h3]
      .sort((a, b) => a.offsetTop - b.offsetTop)
      // Iterate backwards through headings to find the last one above scroll position
      .reverse();

    function handleScroll() {
      // bail if the nav is not visible
      const node = navRef.current;
      if (!node) return;
      if (window.getComputedStyle(node).display !== "block") {
        return;
      }

      for (const heading of combinedHeadings) {
        // 100px arbitrary value to to offset the height of the header (h-16)
        if (window.scrollY + 100 > heading.offsetTop) {
          setActiveHeading(heading.id);
          break;
        }
      }
    }

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [mdRef]);

  return (
    <div
      ref={navRef}
      className="sticky top-36 order-1 mt-20 hidden max-h-[calc(100vh-9rem)] w-56 min-w-min flex-shrink-0 self-start overflow-y-auto pb-10 xl:block"
    >
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
              className={classNames(
                activeHeading == heading.slug &&
                  "text-gray-900 dark:text-gray-50",
                " block py-1 text-sm text-gray-400 hover:text-gray-900 active:text-red-brand dark:text-gray-400 dark:hover:text-gray-50  dark:active:text-red-brand"
              )}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SmallOnThisPage({ doc }: { doc: Doc }) {
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

"use client";

import { useEffect, useState } from "react";
import { Link } from "react-router";
import { clsx } from "clsx";
import type { Doc } from "~/modules/gh-docs/.server";
import { useMarkdownRef } from "./doc-interactions";

export function LargeOnThisPage({ headings }: { headings: Doc["headings"] }) {
  const mdRef = useMarkdownRef();
  const [activeHeading, setActiveHeading] = useState("");

  useEffect(() => {
    const node = mdRef.current;
    if (!node) return;
    const xlQuery = window.matchMedia("(min-width: 1280px)");
    const handleScroll = () => {
      if (!xlQuery.matches) return;
      const heading = Array.from(node.querySelectorAll<HTMLElement>("h2, h3"))
        .sort((a, b) => b.offsetTop - a.offsetTop)
        .find((heading) => window.scrollY + 100 > heading.offsetTop);
      setActiveHeading(heading?.id ?? "");
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [mdRef, headings]);

  return (
    <div className="max-h-[calc(100vh-10.625rem)] overflow-y-auto">
      <nav className="mb-3 flex items-center font-semibold">On this page</nav>
      <ul className="md-toc flex flex-col flex-wrap gap-3 leading-[1.125]">
        {headings.map((heading, i) => (
          <li
            key={i}
            className={heading.headingLevel === "h2" ? "ml-0" : "ml-4"}
          >
            <Link
              to={`#${heading.slug}`}
              dangerouslySetInnerHTML={{ __html: heading.html || "" }}
              className={clsx(
                activeHeading === heading.slug &&
                  "text-gray-900 dark:text-gray-50",
                "block py-1 text-sm text-gray-400 hover:text-gray-900 active:text-red-brand dark:text-gray-400 dark:hover:text-gray-50 dark:active:text-red-brand",
              )}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

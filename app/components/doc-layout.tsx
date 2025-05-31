import { useRef, useState } from "react";
import type { Doc } from "~/modules/gh-docs/.server";
import { useDelegatedReactRouterLinks } from "~/ui/delegate-markdown-links";
import { LargeOnThisPage, SmallOnThisPage } from "./on-this-page";
import iconsHref from "~/icons.svg";

export function DocLayout({
  doc,
  githubPath,
}: {
  doc: Doc;
  githubPath: string;
}) {
  let ref = useRef<HTMLDivElement>(null);
  let [copied, setCopied] = useState(false);

  const copyMarkdown = async () => {
    try {
      const response = await fetch(githubPath);
      if (!response.ok) throw new Error("Failed to fetch markdown");

      const markdown = await response.text();
      await navigator.clipboard.writeText(markdown);

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy markdown:", error);
      try {
        const fallbackText = `# ${doc.attrs.title || "Documentation"}\n\nView the full documentation at: ${window.location.href}`;
        await navigator.clipboard.writeText(fallbackText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (fallbackError) {
        console.error("Fallback copy also failed:", fallbackError);
      }
    }
  };

  const copyButtonText = copied ? "Copied!" : "Copy Page";
  const copyButtonIcon = copied ? "checkmark" : "markdown-copy";

  useDelegatedReactRouterLinks(ref);

  const copyPageButton = (
    <button
      onClick={copyMarkdown}
      className="inline-flex w-full h-8 min-w-[8rem] cursor-pointer items-center justify-center gap-2 rounded-lg border border-gray-200 bg-transparent px-3 text-sm text-black hover:bg-gray-50 dark:border-gray-700 dark:text-white dark:hover:bg-gray-800"
      title={copyButtonText}
      aria-label={copyButtonText}
      data-copied={copied.toString()}
    >
      <span>{copyButtonText}</span>
      <svg className="size-4">
        <use href={`${iconsHref}#${copyButtonIcon}`} />
      </svg>
    </button>
  );

  return (
    <div className="xl:flex xl:w-full xl:justify-between xl:gap-8">
      <div className="min-w-0 px-4 pt-8 xl:order-1 xl:flex-grow xl:pl-0">
        <div ref={ref} className="markdown w-full max-w-3xl pb-[33vh]">
          <div
            className="md-prose"
            dangerouslySetInnerHTML={{ __html: doc.html }}
          />
        </div>
      </div>

      <div className="hidden self-start pt-10 xl:order-2 xl:block xl:w-56 xl:flex-shrink-0">
        {copyPageButton}

        {doc.headings.length > 3 && (
          <LargeOnThisPage doc={doc} mdRef={ref} key={doc.slug} />
        )}
      </div>

      {doc.headings.length > 3 && <SmallOnThisPage doc={doc} />}
    </div>
  );
}

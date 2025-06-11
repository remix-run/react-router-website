import { useState } from "react";
import { DetailsMenu } from "~/modules/details-menu";
import iconsHref from "~/icons.svg";

// FIXME:
// The styles are totally not correct here, this is just a placeholder to get the functionality right
// For the actual designs, see: https://github.com/remix-run/react-router-website/issues/187

export function CopyPageDropdown({
  githubPath,
  githubEditPath,
}: {
  githubPath: string;
  githubEditPath?: string;
}) {
  const [copied, setCopied] = useState(false);

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
        const fallback = "TODO";
        await navigator.clipboard.writeText(fallback);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (fallbackError) {
        console.error("Fallback copy also failed:", fallbackError);
      }
    }
  };

  const copyButtonText = copied ? "Copied!" : "Copy Page";

  return (
    <DetailsMenu className="relative inline-block">
      <summary className="inline-flex h-8 min-w-[8rem] cursor-pointer items-center justify-center gap-2 rounded-lg border border-gray-200 bg-transparent px-3 text-sm text-black hover:bg-gray-50 dark:border-gray-700 dark:text-white dark:hover:bg-gray-800 _no-triangle">
        <span>{copyButtonText}</span>
        <svg className="size-4">
          <use href={`${iconsHref}#dropdown-arrows`} />
        </svg>
      </summary>

      <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
        <div className="p-1">
          <button
            onClick={copyMarkdown}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-black hover:bg-gray-50 dark:text-white dark:hover:bg-gray-800"
          >
            <svg className="size-4">
              <use href={`${iconsHref}#copy`} />
            </svg>
            <div className="flex flex-col items-start">
              <span>{copyButtonText}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Copy Page as Markdown for LLMs
              </span>
            </div>
          </button>

          {githubEditPath && (
            <a
              href={githubEditPath}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-black hover:bg-gray-50 dark:text-white dark:hover:bg-gray-800"
            >
              <svg className="size-4">
                <use href={`${iconsHref}#edit`} />
              </svg>
              <div className="flex flex-col items-start">
                <span>Edit Page</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Edit this page on Github
                </span>
              </div>
            </a>
          )}
        </div>
      </div>
    </DetailsMenu>
  );
}

import { useState } from "react";
import { DetailsMenu } from "~/modules/details-menu";
import iconsHref from "~/icons.svg";
import { useHydrated } from "~/ui/utils";

export function CopyPageDropdown({
  githubPath,
  githubEditPath,
}: {
  githubPath: string;
  githubEditPath?: string;
}) {
  return (
    <DetailsMenu className="relative inline-block group select-none w-full">
      <summary className="_no-triangle cursor-pointer flex text-sm text-gray-300 group hover:text-gray-700 focus-visible:text-gray-700 dark:text-gray-400 dark:hover:text-gray-50 dark:focus-visible:text-gray-50 w-fit">
        <div className="flex py-2 pl-4 pr-3 items-center gap-2 border border-gray-100 dark:border-gray-700 rounded-tl-full rounded-bl-full">
          <svg className="size-5">
            <use href={`${iconsHref}#copy`} />
          </svg>
          <span>Copy Page</span>
        </div>
        <div className="flex py-2 pr-4 pl-2 items-center gap-2 border border-gray-100 dark:border-gray-700 rounded-tr-full rounded-br-full border-l-0 text-gray-300 group-open:text-gray-700 dark:text-gray-400 dark:group-open:text-gray-50 dark:focus-visible:text-gray-50">
          <svg className="size-5">
            <use href={`${iconsHref}#dropdown-arrows`} />
          </svg>
        </div>
      </summary>

      <div className="absolute right-0 z-10 mt-1 rounded-xl border border-gray-100 bg-white shadow-lg p-4 flex flex-col gap-4 w-full min-w-fit dark:border-gray-700 dark:bg-gray-900">
        <CopyButton
          githubPath={githubPath}
          className="flex w-full items-start gap-3 text-gray-400 hover:text-gray-700 focus-visible:text-gray-700 dark:text-gray-400 dark:hover:text-gray-50 dark:focus-visible:text-gray-50"
        />

        {githubEditPath && (
          <a
            href={githubEditPath}
            className="flex w-full items-start gap-3 text-gray-400 hover:text-gray-700 focus-visible:text-gray-700 dark:text-gray-400 dark:hover:text-gray-50 dark:focus-visible:text-gray-50"
          >
            <MenuItem
              icon="edit"
              title="Edit Page"
              description="Edit this page on Github"
            />
          </a>
        )}
      </div>
    </DetailsMenu>
  );
}

function CopyButton({
  githubPath,
  className,
}: {
  githubPath: string;
  className: string;
}) {
  const defaultTitle = "Copy Page";
  const [copiedTitle, setCopiedTitle] = useState(defaultTitle);
  const isHydrated = useHydrated();

  if (!isHydrated) {
    return (
      <a href={githubPath} className={className}>
        <MenuItem
          icon="copy"
          title={copiedTitle}
          description="Copy Page as Markdown"
        />
      </a>
    );
  }

  const copyMarkdown = async () => {
    try {
      const response = await fetch(githubPath);
      if (!response.ok) throw new Error("Failed to fetch markdown");

      const markdown = await response.text();
      await navigator.clipboard.writeText(markdown);

      setCopiedTitle("Copied!");
      setTimeout(() => setCopiedTitle(defaultTitle), 2000);
    } catch (error) {
      console.error("Failed to copy markdown:", error);
      try {
        setCopiedTitle("Failed to copy");
        setTimeout(() => setCopiedTitle(defaultTitle), 2000);
      } catch (fallbackError) {
        console.error("Fallback copy also failed:", fallbackError);
      }
    }
  };

  return (
    <button onClick={copyMarkdown} className={className}>
      <MenuItem
        icon="copy"
        title={copiedTitle}
        description="Copy Page as Markdown"
      />
    </button>
  );
}

function MenuItem({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <>
      <svg className="size-5">
        <use href={`${iconsHref}#${icon}`} />
      </svg>
      <div className="flex flex-col items-start text-left">
        <span>{title}</span>
        <span className="text-xs">{description}</span>
      </div>
    </>
  );
}

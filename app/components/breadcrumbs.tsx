import { useMatches } from "remix";

export default function Breadcrumbs({
  skipText = "Jump to menu",
}: {
  skipText?: string;
}) {
  let matches = useMatches();

  let crumbs = matches
    .filter((match) => match.handle && match.handle.crumb)
    .map((match, index, arr) => (
      <div data-docs-crumb key={match.pathname}>
        {match.handle.crumb(match)}
      </div>
    ));

  return (
    <nav tabIndex={-1} data-docs-crumbs aria-label="Page Breadcrumbs">
      {crumbs}{" "}
      <button
        data-docs-skip
        onClick={() => {
          document
            .querySelector<HTMLSelectElement>("[data-docs-version-select]")
            ?.focus();
        }}
      >
        {skipText}
      </button>
    </nav>
  );
}

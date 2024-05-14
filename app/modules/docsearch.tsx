import type { DocSearchProps } from "@docsearch/react";
import "@docsearch/css/dist/style.css";
import "~/styles/docsearch.css";
import { useHydrated } from "~/ui/utils";
import { Suspense, lazy } from "react";

const OriginalDocSearch = lazy(() =>
  import("@docsearch/react").then((module) => ({
    default: module.DocSearch,
  }))
);

let docSearchProps = {
  appId: "RB6LOUCOL0",
  indexName: "reactrouter",
  apiKey: "b50c5d7d9f4610c9785fa945fdc97476",
} satisfies DocSearchProps;

// TODO: Refactor a bit when we add Vite with css imports per component
// This will allow us to have two versions of the component, one that has
// the button with display: none, and the other with button styles
export function DocSearch() {
  let hydrated = useHydrated();

  if (!hydrated) {
    // The Algolia doc search container is hard-coded at 40px. It doesn't
    // render anything on the server, so we get a mis-match after hydration.
    // This placeholder prevents layout shift when the search appears.
    return <div className="h-10" />;
  }

  return (
    <Suspense fallback={<div className="h-10" />}>
      <div className="animate-[fadeIn_100ms_ease-in_1]">
        <OriginalDocSearch {...docSearchProps} />
      </div>
    </Suspense>
  );
}

import { Suspense, lazy } from "react";
import { type loader as rootLoader } from "~/root";
import { useHydrated } from "~/ui/utils";
import { useRouteLoaderData } from "@remix-run/react";

import "@docsearch/css/dist/style.css";
import "~/styles/search.css";

const DocSearchButton = lazy(() =>
  import("./docsearch").then((module) => ({
    default: module.DocSearch,
  }))
);
const OramaSearchButton = lazy(() =>
  import("./orama").then((module) => ({
    default: module.SearchButton,
  }))
);
const OramaSearch = lazy(() =>
  import("./orama").then((module) => ({
    default: module.SearchModalProvider,
  }))
);

export function SearchModalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  let { bucket, isProductionHost } = useRootData();

  if (bucket === "orama") {
    return (
      <Suspense fallback={null}>
        <OramaSearch environment={isProductionHost ? "prod" : "dev"}>
          {children}
        </OramaSearch>
      </Suspense>
    );
  }

  return <>{children}</>;
}

export function SearchButton() {
  let hydrated = useHydrated();
  let { bucket } = useRootData();

  if (!hydrated) {
    // The Algolia doc search container is hard-coded at 40px. It doesn't
    // render anything on the server, so we get a mis-match after hydration.
    // This placeholder prevents layout shift when the search appears.
    return <div className="h-10" />;
  }

  return (
    <Suspense fallback={<div className="h-10" />}>
      <div className="animate-[fadeIn_100ms_ease-in_1]">
        {bucket === "orama" ? <OramaSearchButton /> : <DocSearchButton />}
      </div>
    </Suspense>
  );
}

function useRootData() {
  const data = useRouteLoaderData<typeof rootLoader>("root");

  if (!data) {
    throw new Error("useBucket must be used within root route loader");
  }

  return data;
}

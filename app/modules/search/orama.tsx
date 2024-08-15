import {
  Suspense,
  createContext,
  lazy,
  useContext,
  useMemo,
  useState,
} from "react";
import { useHydrated, useLayoutEffect } from "~/ui/utils";
import { useColorScheme } from "~/modules/color-scheme/components";

import "@orama/searchbox/dist/index.css";

const OramaSearch = lazy(() =>
  import("@orama/searchbox").then((module) => ({
    default: module.SearchBox,
  }))
);

const SearchModalContext = createContext<null | ((show: boolean) => void)>(
  null
);

export function SearchModalProvider({
  environment,
  children,
}: {
  environment: "prod" | "dev";
  children: React.ReactNode;
}) {
  let [showSearchModal, setShowSearchModal] = useState(false);
  const isHydrated = useHydrated();
  const colorScheme = useSearchModalColorScheme();

  const cloudConfig = useMemo(() => {
    return environment === "prod"
      ? {
          url: "https://cloud.orama.run/v1/indexes/react-router-prod-rk4lmw",
          key: "w27ab0xTLXlBW5fM4Cg07asblm0tFsiP",
        }
      : {
          // The search endpoint for the Orama index
          url: "https://cloud.orama.run/v1/indexes/react-router-dev-nwm58f",
          // The public API key for performing search. This is commit-safe.
          key: "23DOEM1uyLIqnumsPZICJzw2Xn7GSFkj",
        };
  }, [environment]);

  return (
    <SearchModalContext.Provider value={setShowSearchModal}>
      <Suspense fallback={null}>
        {isHydrated ? (
          <OramaSearch
            cloudConfig={cloudConfig}
            show={showSearchModal}
            onClose={() => setShowSearchModal(false)}
            colorScheme={colorScheme}
            theme="secondary"
            themeConfig={{
              light: {
                "--background-color-fourth": "#f7f7f7",
              },
              dark: {
                "--background-color-fourth": "#383838",
              },
            }}
            resultsMap={{
              description: "content",
            }}
            facetProperty="section"
            searchMode="hybrid"
            backdrop
          />
        ) : null}
      </Suspense>
      {children}
    </SearchModalContext.Provider>
  );
}

function useSetShowSearchModal() {
  let context = useContext(SearchModalContext);
  if (!context) {
    throw new Error("useSearchModal must be used within a SearchModalProvider");
  }
  return context;
}

export function SearchButton() {
  let hydrated = useHydrated();
  let setShowSearchModal = useSetShowSearchModal();

  if (!hydrated) {
    return <div className="h-10" />;
  }

  // TODO: replace styles
  return (
    <>
      <div className="animate-[fadeIn_100ms_ease-in_1]">
        <button
          onClick={() => setShowSearchModal(true)}
          type="button"
          className="DocSearch DocSearch-Button"
          aria-label="Search"
        >
          <span className="DocSearch-Button-Container">
            <svg
              width="20"
              height="20"
              className="DocSearch-Search-Icon"
              viewBox="0 0 20 20"
            >
              <path
                d="M14.386 14.386l4.0877 4.0877-4.0877-4.0877c-2.9418 2.9419-7.7115 2.9419-10.6533 0-2.9419-2.9418-2.9419-7.7115 0-10.6533 2.9418-2.9419 7.7115-2.9419 10.6533 0 2.9419 2.9418 2.9419 7.7115 0 10.6533z"
                stroke="currentColor"
                fill="none"
                fillRule="evenodd"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
            </svg>
            <span className="DocSearch-Button-Placeholder">Search</span>
          </span>
          <span className="DocSearch-Button-Keys">
            <kbd className="DocSearch-Button-Key">⌘</kbd>
            <kbd className="DocSearch-Button-Key">K</kbd>
          </span>
        </button>
      </div>
    </>
  );
}

// TODO: integrate this with ColorSchemeScript so we're not setting multiple listeners on the same media query
function useSearchModalColorScheme() {
  let colorScheme = useColorScheme();
  let [systemColorScheme, setSystemColorScheme] = useState<
    null | "light" | "dark"
  >(null);
  useLayoutEffect(() => {
    if (colorScheme !== "system") {
      setSystemColorScheme(null);
      return;
    }
    let media = window.matchMedia("(prefers-color-scheme: dark)");
    let handleMedia = () =>
      setSystemColorScheme(media.matches ? "dark" : "light");
    handleMedia();
    media.addEventListener("change", handleMedia);
    return () => {
      media.removeEventListener("change", handleMedia);
    };
  }, [colorScheme]);
  if (colorScheme !== "system") {
    return colorScheme;
  }
  if (systemColorScheme) {
    return systemColorScheme;
  }
  return "dark";
}

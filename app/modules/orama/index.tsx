import { createContext, useContext, useState } from "react";
import { useHydrated, useLayoutEffect } from "~/ui/utils";
import { SearchBox } from "@orama/searchbox/dist/index";
import { OramaClient } from "@oramacloud/client";
import { useColorScheme } from "~/modules/color-scheme/components";
import { createPortal } from "react-dom";

import "@orama/searchbox/dist/index.css";
import "./search.css";

const oramaInstance = new OramaClient({
  // The search endpoint for the Orama index
  endpoint: "https://cloud.orama.run/v1/indexes/react-router-dev-nwm58f",
  // The public API key for performing search. This is commit-safe.
  api_key: "23DOEM1uyLIqnumsPZICJzw2Xn7GSFkj",
});

const SearchModalContext = createContext<
  null | [boolean, React.Dispatch<React.SetStateAction<boolean>>]
>(null);

export function SearchModalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  let [showSearchModal, setShowSearchModal] = useState(false);

  return (
    <SearchModalContext.Provider value={[showSearchModal, setShowSearchModal]}>
      {children}
    </SearchModalContext.Provider>
  );
}

function useSearchModal() {
  let context = useContext(SearchModalContext);
  if (!context) {
    throw new Error("useSearchModal must be used within a SearchModalProvider");
  }
  if (context === null) throw new Error("");
  return context;
}

export function SearchModal() {
  let colorScheme = useSearchModalColorScheme();
  let [show, setShow] = useSearchModal();
  let hydrated = useHydrated();
  if (!hydrated) {
    return null;
  }

  // TODO: Need to implement onClose, otherwise it's impossible to make this a controlled component

  return createPortal(
    <SearchBox
      show={show}
      oramaInstance={oramaInstance}
      colorScheme={colorScheme}
      theme="secondary"
      resultsMap={{
        description: "content",
      }}
      facetProperty="section"
      searchParams={{
        threshold: 0,
      }}
      backdrop
      themeConfig={{
        light: {},
        dark: {
          "--backdrop-bg-color": "#29282ee6",
        },
      }}

      // The public API key for summary generation. This is commit-safe.
      // we can come back to using this summary, but as of now I don't trust the results enough
      // summaryGeneration="vht9ve9d-Rz0HcnWsxY+9icY$a_HkwPb"
    />,
    document.body
  );
}

export function SearchButton() {
  let [, setShowSearchModal] = useSearchModal();

  let hydrated = useHydrated();

  if (!hydrated) {
    // The Algolia doc search container is hard-coded at 40px. It doesn't
    // render anything on the server, so we get a mis-match after hydration.
    // This placeholder prevents layout shift when the search appears.
    return <div className="h-10" />;
  }

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

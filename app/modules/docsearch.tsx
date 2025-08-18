import {
  createContext,
  use,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useMatches } from "react-router";
import type { DocSearchProps } from "@docsearch/react";
import {
  DocSearchModal as OriginalDocSearchModal,
  DocSearchButton as OriginalDocSearchButton,
  useDocSearchKeyboardEvents,
} from "@docsearch/react";
import type { HeaderData } from "~/components/docs-header/data.server";

import docsearchCss from "~/styles/docsearch.css?url";

let docSearchProps = {
  appId: "RB6LOUCOL0",
  indexName: "reactrouter",
  apiKey: "b50c5d7d9f4610c9785fa945fdc97476",
} satisfies DocSearchProps;

const DocSearchContext = createContext<{
  onOpen: () => void;
  searchButtonRef: React.RefObject<HTMLButtonElement | null>;
} | null>(null);

/**
 * DocSearch but only the modal accessible by keyboard command
 * Intended for people instinctively pressing cmd+k on a non-doc page
 *
 * If you need a DocSearch button to appear, use the DocSearch component
 * Modified from https://github.com/algolia/docsearch/blob/main/packages/docsearch-react/src/DocSearch.tsx
 */
export function DocSearch({ children }: { children: React.ReactNode }) {
  const searchButtonRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const onOpen = useCallback(() => {
    setIsOpen(true);
  }, [setIsOpen]);

  const onClose = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  const onInput = useCallback(() => {
    setIsOpen(true);
  }, [setIsOpen]);

  useDocSearchKeyboardEvents({
    isOpen,
    onOpen,
    onClose,
    onInput,
    // @ts-expect-error docsearch types are not updated for react 19
    searchButtonRef,
  });

  const contextValue = useMemo(
    () => ({
      onOpen,
      searchButtonRef,
    }),
    [onOpen, searchButtonRef],
  );

  const version = useDocSearchFacetVersion();

  return (
    <DocSearchContext value={contextValue}>
      <link rel="stylesheet" href={docsearchCss} precedence="high" />
      {children}
      {isOpen
        ? createPortal(
            <OriginalDocSearchModal
              initialScrollY={window.scrollY}
              onClose={onClose}
              // NOTE: to use the facet for search, it has to be set in the algolia dashboard:
              // "Configuration" > "Filtering and Faceting" > "Facets"
              searchParameters={{
                facetFilters: [`version:${version}`],
              }}
              {...docSearchProps}
            />,
            document.body,
          )
        : null}
    </DocSearchContext>
  );
}

export function DocSearchButton() {
  const docSearchContext = use(DocSearchContext);

  if (!docSearchContext) {
    throw new Error("DocSearch must be used within a DocSearchModal");
  }

  const { onOpen, searchButtonRef } = docSearchContext;

  return <OriginalDocSearchButton ref={searchButtonRef} onClick={onOpen} />;
}

/*
 * Returns the version to use for the DocSearch facet
 */
function useDocSearchFacetVersion() {
  let matches = useMatches();

  let headerMatch = matches.find(
    ({ loaderData }) =>
      loaderData && typeof loaderData === "object" && "header" in loaderData,
  )?.loaderData as { header: HeaderData } | undefined;

  //  Users can cmd+k on any page, so always assume v7 if there's no further context
  let version: HeaderData["docSearchVersion"] = "v7";
  if (headerMatch?.header && headerMatch.header.ref.startsWith("6")) {
    version = "v6";
  }

  return version;
}

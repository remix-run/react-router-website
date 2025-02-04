import {
  createContext,
  use,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import type { DocSearchProps } from "@docsearch/react";
import {
  DocSearchModal as OriginalDocSearchModal,
  DocSearchButton as OriginalDocSearchButton,
  useDocSearchKeyboardEvents,
} from "@docsearch/react";

let docSearchProps = {
  appId: "RB6LOUCOL0",
  indexName: "reactrouter",
  apiKey: "b50c5d7d9f4610c9785fa945fdc97476",
} satisfies DocSearchProps;

// TODO:
// - pass version to searchParameters facetFilters via prop
//
// NOTE: facet has to be set in the algolia dashboard under "Configuration" | "Filtering and Faceting" | "Facets"

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
export function DocSearch({
  children,
  version = "v7",
}: {
  children: React.ReactNode;
  version?: "v7" | "v6";
}) {
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

  return (
    <DocSearchContext value={contextValue}>
      {children}
      {isOpen
        ? createPortal(
            <OriginalDocSearchModal
              initialScrollY={window.scrollY}
              onClose={onClose}
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

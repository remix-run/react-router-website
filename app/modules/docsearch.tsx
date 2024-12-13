import {
  Suspense,
  createContext,
  lazy,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useDocSearchKeyboardEvents } from "@docsearch/react/dist/esm";
import type { DocSearchProps } from "@docsearch/react";

let OriginalDocSearchModal = lazy(() =>
  import("@docsearch/react").then((module) => ({
    default: module.DocSearchModal,
  }))
);

let OriginalDocSearchButton = lazy(() =>
  import("@docsearch/react").then((module) => ({
    default: module.DocSearchButton,
  }))
);

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
    [onOpen, searchButtonRef]
  );

  return (
    <DocSearchContext.Provider value={contextValue}>
      {children}
      {isOpen
        ? createPortal(
            <Suspense fallback={null}>
              <OriginalDocSearchModal
                initialScrollY={window.scrollY}
                onClose={onClose}
                {...docSearchProps}
              />
            </Suspense>,
            document.body
          )
        : null}
    </DocSearchContext.Provider>
  );
}

export function DocSearchButton() {
  const docSearchContext = useContext(DocSearchContext);

  if (!docSearchContext) {
    throw new Error("DocSearch must be used within a DocSearchModal");
  }

  const { onOpen, searchButtonRef } = docSearchContext;

  return (
    <Suspense fallback={<div className="h-10" />}>
      <OriginalDocSearchButton ref={searchButtonRef} onClick={onOpen} />
    </Suspense>
  );
}

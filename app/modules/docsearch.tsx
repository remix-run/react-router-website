"use client";

import {
  createContext,
  use,
  useCallback,
  useMemo,
  useRef,
  useState,
  useEffect,
  lazy,
  Suspense,
} from "react";
import { createPortal } from "react-dom";
import { useMatches } from "react-router";
import { useDocSearchKeyboardEvents } from "~/hooks/use-docsearch-keyboard-events";

import docsearchCss from "~/styles/docsearch.css?url";

// Keep all Algolia runtime imports behind this dynamic boundary. Importing even
// its button/hooks from the package barrel would eagerly load the modal chunk.
const SearchModal = lazy(() => import("./docsearch-modal"));

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

  useDocSearchKeyboardEvents({ isOpen, onOpen, onClose, searchButtonRef });

  const contextValue = useMemo(
    () => ({
      onOpen,
      searchButtonRef,
    }),
    [onOpen, searchButtonRef],
  );

  let docSearchVersion = useMatches()
    .map((match) => match.loaderData)
    .find(
      (loaderData): loaderData is { docSearchVersion: string } =>
        typeof loaderData === "object" &&
        loaderData !== null &&
        "docSearchVersion" in loaderData &&
        typeof loaderData.docSearchVersion === "string",
    )?.docSearchVersion;

  return (
    <DocSearchContext value={contextValue}>
      <link rel="stylesheet" href={docsearchCss} precedence="high" />
      {children}
      {isOpen
        ? createPortal(
            <Suspense fallback={null}>
              <SearchModal
                initialScrollY={window.scrollY}
                onClose={onClose}
                docSearchVersion={docSearchVersion}
              />
            </Suspense>,
            document.body,
          )
        : null}
    </DocSearchContext>
  );
}

export function DocSearchButton() {
  const [modifier, setModifier] = useState<"Command" | "Ctrl" | null>(null);
  useEffect(() => {
    setModifier(
      /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform) ? "Command" : "Ctrl",
    );
  }, []);
  const docSearchContext = use(DocSearchContext);

  if (!docSearchContext) {
    throw new Error("DocSearch must be used within a DocSearchModal");
  }

  const { onOpen, searchButtonRef } = docSearchContext;

  return (
    <button
      type="button"
      className="DocSearch DocSearch-Button"
      aria-label={`Search (${modifier ?? "Command"}+K)`}
      ref={searchButtonRef}
      onClick={onOpen}
    >
      <span className="DocSearch-Button-Container">
        <svg
          className="DocSearch-Search-Icon"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path
            d="M14.386 14.386l4.0877 4.0877-4.0877-4.0877c-2.9418 2.9419-7.7115 2.9419-10.6533 0-2.9419-2.9418-2.9419-7.7115 0-10.6533 2.9418-2.9419 7.7115-2.9419 10.6533 0 2.9419 2.9418 2.9419 7.7115 0 10.6533z"
            stroke="currentColor"
            fill="none"
            fillRule="evenodd"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="DocSearch-Button-Placeholder">Search</span>
      </span>
      <span className="DocSearch-Button-Keys" aria-hidden="true">
        {modifier && (
          <>
            <kbd className="DocSearch-Button-Key">
              {modifier === "Command" ? "⌘" : "Ctrl"}
            </kbd>
            <kbd className="DocSearch-Button-Key">K</kbd>
          </>
        )}
      </span>
    </button>
  );
}

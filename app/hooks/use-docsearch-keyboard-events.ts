import { useEffect, type RefObject } from "react";

// Keep keyboard handling independent of Algolia's eagerly bundled runtime.
export function useDocSearchKeyboardEvents({
  isOpen,
  onOpen,
  onClose,
  searchButtonRef,
}: {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  searchButtonRef: RefObject<HTMLButtonElement | null>;
}) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target;
      const isEditing =
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          ["INPUT", "SELECT", "TEXTAREA"].includes(target.tagName));
      const shortcut =
        event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey);

      if (
        (event.key === "Escape" && isOpen) ||
        shortcut ||
        (event.key === "/" && !isEditing && !isOpen)
      ) {
        event.preventDefault();
        if (isOpen) onClose();
        else if (!document.body.classList.contains("DocSearch--active"))
          onOpen();
      } else if (
        target === searchButtonRef.current &&
        event.key.length === 1 &&
        /^[a-z0-9]$/i.test(event.key) &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey
      ) {
        onOpen();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onOpen, onClose, searchButtonRef]);
}

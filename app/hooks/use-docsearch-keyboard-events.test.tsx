import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, useRef, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { useDocSearchKeyboardEvents } from "./use-docsearch-keyboard-events";

function Search() {
  const [isOpen, setIsOpen] = useState(false);
  const searchButtonRef = useRef<HTMLButtonElement>(null);
  useDocSearchKeyboardEvents({
    isOpen,
    onOpen: () => setIsOpen(true),
    onClose: () => setIsOpen(false),
    searchButtonRef,
  });

  return (
    <>
      <button ref={searchButtonRef} onClick={() => setIsOpen(true)}>
        Search
      </button>
      {isOpen && <div role="dialog">Search is open</div>}
      <input />
      <textarea />
      <select>
        <option>Example</option>
      </select>
      <div contentEditable />
    </>
  );
}

describe("search keyboard shortcuts", () => {
  let root: Root;
  let container: HTMLDivElement;

  beforeEach(async () => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    await act(async () => root.render(<Search />));
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
    document.body.classList.remove("DocSearch--active");
    vi.unstubAllGlobals();
  });

  async function key(
    key: string,
    extra: KeyboardEventInit = {},
    target: EventTarget = window,
  ) {
    const event = new KeyboardEvent("keydown", {
      key,
      bubbles: true,
      cancelable: true,
      ...extra,
    });
    await act(async () => {
      target.dispatchEvent(event);
    });
    return event;
  }

  const dialog = () => container.querySelector('[role="dialog"]');

  it.each(["ctrlKey", "metaKey"] as const)(
    "toggles search with %s+K and prevents the browser shortcut",
    async (modifier) => {
      expect((await key("K", { [modifier]: true })).defaultPrevented).toBe(
        true,
      );
      expect(dialog()).not.toBeNull();
      await key("k", { [modifier]: true });
      expect(dialog()).toBeNull();
    },
  );

  it("opens with slash and only handles Escape while search is open", async () => {
    expect((await key("Escape")).defaultPrevented).toBe(false);
    expect((await key("/")).defaultPrevented).toBe(true);
    expect(dialog()).not.toBeNull();
    expect((await key("Escape")).defaultPrevented).toBe(true);
    expect(dialog()).toBeNull();
  });

  it("does not intercept slash while editing text or selecting an option", async () => {
    for (const selector of [
      "input",
      "textarea",
      "select",
      "[contenteditable]",
    ]) {
      expect(
        (await key("/", {}, container.querySelector(selector)!))
          .defaultPrevented,
      ).toBe(false);
      expect(dialog()).toBeNull();
    }
  });

  it("opens when typing on the search button but ignores ordinary and modified typing elsewhere", async () => {
    const button = container.querySelector("button")!;
    await key("a");
    await key("a", { altKey: true }, button);
    expect(dialog()).toBeNull();
    await key("a", {}, button);
    expect(dialog()).not.toBeNull();
  });

  it("avoids opening a second DocSearch modal and removes the listener on unmount", async () => {
    document.body.classList.add("DocSearch--active");
    await key("k", { ctrlKey: true });
    expect(dialog()).toBeNull();
    document.body.classList.remove("DocSearch--active");
    await act(async () => root.unmount());
    expect((await key("k", { ctrlKey: true })).defaultPrevented).toBe(false);
  });
});

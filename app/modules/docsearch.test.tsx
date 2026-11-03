import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";

const { loadModal, modalReady } = vi.hoisted(() => {
  let resolve!: () => void;
  const promise = new Promise<void>((ready) => {
    resolve = ready;
  });
  return { loadModal: vi.fn(), modalReady: { promise, resolve } };
});
vi.mock("react-router", () => ({
  useMatches: () => [
    { loaderData: { colorScheme: "system" } },
    { loaderData: { docSearchVersion: "v8" } },
  ],
}));
vi.mock("./docsearch-modal", async () => {
  loadModal();
  await modalReady.promise;
  return {
    default: ({
      onClose,
      docSearchVersion,
    }: {
      onClose: () => void;
      docSearchVersion?: string;
    }) => (
      <div role="dialog" aria-label="Search" data-version={docSearchVersion}>
        <button onClick={onClose}>Close search</button>
      </div>
    ),
  };
});

import { DocSearch, DocSearchButton } from "./docsearch";

describe("lazy docs search", () => {
  let root: Root;
  let container: HTMLDivElement;

  beforeEach(async () => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    await act(async () => {
      root.render(
        <DocSearch>
          <DocSearchButton />
        </DocSearch>,
      );
    });
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
    vi.unstubAllGlobals();
  });

  it("lazily loads on open without showing a loading dialog", async () => {
    expect(loadModal).not.toHaveBeenCalled();
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    await act(async () => {
      container.querySelector("button")!.click();
    });
    expect(loadModal).toHaveBeenCalledOnce();
    expect(document.querySelector('[role="dialog"]')).toBeNull();

    // Closing before the chunk arrives must cancel the pending open.
    await act(async () => {
      window.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", cancelable: true }),
      );
    });
    await act(async () => {
      modalReady.resolve();
    });
    expect(document.querySelector('[role="dialog"]')).toBeNull();

    await act(async () => {
      container.querySelector("button")!.click();
    });
    expect(document.querySelector('[role="dialog"]')).toHaveAttribute(
      "data-version",
      "v8",
    );
    await act(async () => {
      document
        .querySelector<HTMLButtonElement>('[role="dialog"] button')!
        .click();
    });
    expect(document.querySelector('[role="dialog"]')).toBeNull();
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";

const { navigate } = vi.hoisted(() => ({ navigate: vi.fn() }));
vi.mock("react-router", () => ({ useNavigate: () => navigate }));

import { DocInteractions, MarkdownContent } from "./doc-interactions";

describe("Markdown client interactions", () => {
  let root: Root;
  let container: HTMLDivElement;

  beforeEach(() => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    navigate.mockReset();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("delegates internal links while preserving modified clicks", async () => {
    await act(async () => {
      root.render(
        <DocInteractions>
          <MarkdownContent>
            <a href="/next?mode=data#intro">Next</a>
          </MarkdownContent>
        </DocInteractions>,
      );
    });
    const link = container.querySelector("a")!;
    const click = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      button: 0,
    });
    link.dispatchEvent(click);
    expect(click.defaultPrevented).toBe(true);
    expect(navigate).toHaveBeenCalledWith({
      pathname: "/next",
      search: "?mode=data",
      hash: "#intro",
    });

    navigate.mockClear();
    const modified = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      button: 0,
      ctrlKey: true,
    });
    link.dispatchEvent(modified);
    expect(modified.defaultPrevented).toBe(false);
    expect(navigate).not.toHaveBeenCalled();
  });

  it("copies code and refreshes the buttons when server-rendered content changes", async () => {
    const writeText = vi
      .spyOn(navigator.clipboard, "writeText")
      .mockResolvedValue();
    async function render(count: number) {
      await act(async () => {
        root.render(
          <DocInteractions>
            <MarkdownContent>
              {Array.from({ length: count }, (_, i) => (
                <div key={i} data-code-block data-lang="ts">
                  <pre>Example {i}</pre>
                </div>
              ))}
            </MarkdownContent>
          </DocInteractions>,
        );
      });
    }

    await render(1);
    expect(container.querySelectorAll("[data-code-block-copy]")).toHaveLength(
      1,
    );
    await act(async () => {
      container
        .querySelector<HTMLButtonElement>("[data-code-block-copy]")!
        .click();
    });
    expect(writeText).toHaveBeenCalledWith("Example 0");

    await render(2);
    expect(container.querySelectorAll("[data-code-block-copy]")).toHaveLength(
      2,
    );
  });
});

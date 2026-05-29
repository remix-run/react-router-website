import { describe, it, expect } from "vitest";
import { prefersMarkdown } from "./markdown-negotiation";

const MARKDOWN_PREFERRED_ACCEPT =
  "text/markdown, text/x-markdown;q=0.9, text/plain;q=0.6, text/html;q=0.5, */*;q=0.1";

describe("prefersMarkdown", () => {
  it("returns false when there is no Accept header", () => {
    expect(prefersMarkdown(null)).toBe(false);
    expect(prefersMarkdown("")).toBe(false);
  });

  it("keeps serving HTML to browsers", () => {
    expect(
      prefersMarkdown(
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      ),
    ).toBe(false);
    expect(
      prefersMarkdown(
        "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      ),
    ).toBe(false);
  });

  it("serves HTML for `*/*`", () => {
    expect(prefersMarkdown("*/*")).toBe(false);
  });

  it("serves markdown when it is the only accepted type", () => {
    expect(prefersMarkdown("text/markdown")).toBe(true);
    expect(prefersMarkdown("text/x-markdown")).toBe(true);
  });

  it("serves markdown when ranked above html via q-values", () => {
    expect(prefersMarkdown(MARKDOWN_PREFERRED_ACCEPT)).toBe(true);
  });

  it("defaults to HTML on a tie", () => {
    expect(prefersMarkdown("text/markdown,text/html")).toBe(false);
    expect(prefersMarkdown("text/markdown;q=0.8,text/html;q=0.8")).toBe(false);
  });

  it("serves HTML when html outranks markdown", () => {
    expect(prefersMarkdown("text/markdown;q=0.5,text/html")).toBe(false);
  });

  it("uses the best q-value for duplicate media ranges", () => {
    expect(
      prefersMarkdown("text/markdown;q=0.3,text/html;q=0.8,text/markdown;q=0.9"),
    ).toBe(true);
  });

  it("is case-insensitive and tolerant of whitespace", () => {
    expect(prefersMarkdown("TEXT/MARKDOWN")).toBe(true);
    expect(prefersMarkdown("  text/markdown ;Q=1 ")).toBe(true);
  });
});

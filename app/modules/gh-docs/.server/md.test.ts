import { load } from "cheerio";
import { describe, expect, it } from "vitest";

import { processMarkdown } from "./md";

describe("processMarkdown", () => {
  it("supports diff markers on syntax-highlighted code blocks", async () => {
    let { html } = await processMarkdown(`
\`\`\`tsx diff
-import { OldLink } from "react-router";
+import { NewLink } from "react-router";

export default function App() {
- let oldPath = "/old";
+ let newPath = "/new";

  return (
    <div>
-     <OldLink to={oldPath} />
+     <NewLink to={newPath} />
    </div>
    );
}
\`\`\`
`);
    let $ = load(html);
    let lines = $(".codeblock-line").toArray();

    expect($("pre").attr("data-lang")).toBe("tsx");
    expect($("pre").attr("data-diff")).toBe("");
    expect(lines).toHaveLength(14);
    expect($(lines[0]).attr("data-remove")).toBe("");
    expect($(lines[0]).text()).toMatch(/^import .*OldLink/);
    expect($(lines[1]).attr("data-add")).toBe("");
    expect($(lines[1]).text()).toMatch(/^import .*NewLink/);
    expect($(lines[3]).attr("data-add")).toBeUndefined();
    expect($(lines[3]).text()).toMatch(/^export default/);
    expect($(lines[4]).attr("data-remove")).toBe("");
    expect($(lines[4]).text()).toMatch(/^  let oldPath/);
    expect($(lines[5]).attr("data-add")).toBe("");
    expect($(lines[5]).text()).toMatch(/^  let newPath/);
    expect($(lines[9]).attr("data-remove")).toBe("");
    expect($(lines[9]).text()).toMatch(/^      <OldLink/);
    expect($(lines[10]).attr("data-add")).toBe("");
    expect($(lines[10]).text()).toMatch(/^      <NewLink/);
  });
});

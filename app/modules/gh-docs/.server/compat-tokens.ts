import type { Plugin } from "unified";
import type { Root, Paragraph, Text, HTML } from "mdast";
import type { Element } from "hast";
import { visit } from "unist-util-visit";
import { fromHtml } from "hast-util-from-html";
import { toHtml } from "hast-util-to-html";
import { toString } from "hast-util-to-string";

interface CompatOptions {
  baseUrl?: string;
}

function createCompatList(
  availableItems: string[],
  baseUrl: string = "../../home",
): Element {
  const html = `
    <ul class="availability-main">
      <li>
        <a href="${baseUrl}" className="${availableItems.includes("framework") ? "yes" : "no"}" title="${availableItems.includes("framework") ? "Available with Framework" : "Not available with Framework"}"><svg><use href="/_docs/mode-icons.svg#framework"/></svg> Framework</a>
      </li>
      <li>
        <a href="${baseUrl}" className="${availableItems.includes("data") ? "yes" : "no"}" title="${availableItems.includes("data") ? "Available with Data" : "Not available with Data"}"><svg><use href="/_docs/mode-icons.svg#data"/></svg> Data</a>
      </li>
      <li>
        <a href="${baseUrl}" className="${availableItems.includes("declarative") ? "yes" : "no"}" title="${availableItems.includes("declarative") ? "Available with Declarative" : "Not available with Declarative"}"><svg><use href="/_docs/mode-icons.svg#declarative"/></svg> Declarative</a>
      </li>
    </ul>
  `
    .split("\n")
    .map((line) => line.replace(/^\s+/, ""))
    .filter(Boolean)
    .join("");

  return fromHtml(html, { fragment: true }).children[0] as Element;
}

function createSmallCompatList(
  availableItems: string[],
  baseUrl: string = "../../home",
): Element {
  const html = `
    <ul class="availability-small">
      <li>
        <a href="${baseUrl}" className="${availableItems.includes("framework") ? "yes" : "no"}" title="${availableItems.includes("framework") ? "Available with Framework" : "Not available with Framework"}"><svg><use href="/_docs/mode-icons.svg#framework"/></svg></a>
      </li>
      <li>
        <a href="${baseUrl}" className="${availableItems.includes("data") ? "yes" : "no"}" title="${availableItems.includes("data") ? "Available with Data" : "Not available with Data"}"><svg><use href="/_docs/mode-icons.svg#data"/></svg></a>
      </li>
      <li>
        <a href="${baseUrl}" className="${availableItems.includes("declarative") ? "yes" : "no"}" title="${availableItems.includes("declarative") ? "Available with Declarative" : "Not available with Declarative"}"><svg><use href="/_docs/mode-icons.svg#declarative"/></svg></a>
      </li>
    </ul>
  `
    .split("\n")
    .map((line) => line.replace(/^\s+/, ""))
    .filter(Boolean)
    .join("");

  return fromHtml(html, { fragment: true }).children[0] as Element;
}

const MODES_REGEX = /^\[MODES:\s*([^\]]+)\]$/;
const MODES_SMALL_REGEX = /^\[modes:\s*([^\]]+)\]$/;

const remarkCompatLists: Plugin<[CompatOptions?], Root> = (options = {}) => {
  const baseUrl = options.baseUrl || "../../home";

  return (tree) => {
    visit(tree, "paragraph", (node, index, parent) => {
      if (!parent || typeof index === "undefined" || node.children.length !== 1)
        return;

      const child = node.children[0];
      if (child.type !== "text") return;

      const text = child.value.trim();
      const matchBig = text.match(MODES_REGEX);
      const matchSmall = text.match(MODES_SMALL_REGEX);

      if (matchBig || matchSmall) {
        const modes = (matchBig || matchSmall)![1]
          .split(",")
          .map((mode) => mode.trim())
          .filter(Boolean);

        const compatList = matchBig
          ? createCompatList(modes, baseUrl)
          : createSmallCompatList(modes, baseUrl);

        // Replace the paragraph node with our HTML node
        parent.children.splice(index, 1, {
          type: "html",
          value: toHtml(compatList),
        });
        return index + 1;
      }
    });
  };
};

export default remarkCompatLists;

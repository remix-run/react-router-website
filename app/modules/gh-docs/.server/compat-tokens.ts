import type { Plugin } from "unified";
import type { Root, Element } from "hast";
import { visit } from "unist-util-visit";
import { fromHtml } from "hast-util-from-html";
import { toString } from "hast-util-to-string";

interface CompatOptions {
  baseUrl?: string;
}

interface Frontmatter {
  availability?: string[];
  "availability-props"?: Record<string, string[]>;
}

function createCompatList(
  availableItems: string[],
  baseUrl: string = "../../home",
): Element {
  // Define all possible items in the desired order
  const allItems = ["framework", "data", "declarative"];

  const html = `
    <ul class="compat">
      <li><a href="${baseUrl}" class="info">Availability:</a></li>
      ${allItems
        .map(item => {
          const isAvailable = availableItems.includes(item);
          const className = isAvailable ? "compat-yes" : "compat-no";
          const icon = isAvailable ? "✅" : "🚫";
          return `<li><a href="${baseUrl}" class="${className}">${icon} ${item}</a></li>`;
        })
        .join("\n")}
    </ul>
  `
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean)
    .join("");

  return fromHtml(html, { fragment: true }).children[0] as Element;
}

function normalizePropertyName(name: string): string {
  return name.replace(/[^\w]/g, "");
}

const rehypeCompatLists: Plugin<[CompatOptions?], Root> = (options = {}) => {
  const baseUrl = options.baseUrl || "../../home";

  return (tree, file) => {
    const frontmatter = file.data.matter as Frontmatter | undefined;
    if (!frontmatter?.availability) return; // Early return if no availability metadata

    const availability = frontmatter.availability || [];
    const availabilityProps = frontmatter["availability-props"] || {};

    // Track if we've inserted the main compatibility list
    let mainCompatInserted = false;

    visit(tree, "element", (node, index, parent) => {
      // console.log(1);
      if (!parent || typeof index === "undefined") return;
      // console.log(2);

      // Handle main heading compatibility list
      if (!mainCompatInserted && node.tagName === "h1") {
        console.log("Before splice", parent.children.length);
        // const compatList = createCompatList(availability, baseUrl);
        const compatList = createCompatList(availability, baseUrl);
        parent.children.splice(index + 1, 0, compatList);
        mainCompatInserted = true;
        console.log("After splice:", parent.children.length);
        return true; // Explicitly continue traversal
      }

      // Handle property-level compatibility lists
      if (node.tagName === "h3") {
        const headingText = toString(node);
        const propName = normalizePropertyName(headingText);
        console.log("H3 found:", {
          original: headingText,
          normalized: propName,
          availableKeys: Object.keys(availabilityProps),
          normalizedKeys: Object.keys(availabilityProps).map(k =>
            normalizePropertyName(k),
          ),
        });

        for (const [key, value] of Object.entries(availabilityProps)) {
          console.log("Comparing:", {
            propName,
            key,
            normalizedKey: normalizePropertyName(key),
            arrayValue: value,
            matches: normalizePropertyName(key) === propName,
          });
          if (normalizePropertyName(key) === propName) {
            const compatList = createCompatList(value, baseUrl);
            parent.children.splice(index + 1, 0, compatList);
            console.log("Added compat list for", key);
            break;
          }
        }
      }
    });
  };
};

export default rehypeCompatLists;

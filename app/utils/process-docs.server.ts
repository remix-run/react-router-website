import parseAttributes from "gray-matter";
import { reactRouterProcessMarkdown as processMarkdown } from "./process-markdown";
import type { Entry } from "./get-docs.server";

interface Attributes {
  title: string;
  order?: number;
  disabled: boolean;
  siblingLinks: boolean;
  published?: string;
  description?: string;
  hidden: boolean;
  toc: boolean;
}

interface ProcessedDoc {
  attributes: Attributes;
  html: string;
  title: string;
  path: string;
  source: string;
  md: string;
  lang: string;
  hasContent: boolean;
}

async function processDoc(entry: Entry): Promise<ProcessedDoc> {
  let { data, content } = parseAttributes(entry.content!);
  let hasContent = content.trim() !== "";

  let path = entry.path.replace(/^\/docs/, "");
  let title = data.title || path;
  let langMatch = path.match(/^\/_i18n\/(?<lang>[a-z]{2})\//);
  let lang = langMatch?.groups?.lang ?? "en";
  let source = path.replace(/^\/_i18n\/[a-z]{2}/, "");

  let examplesRegex = /^\/examples\/(?<exampleName>[^\/+]+)\/README.md/;
  let isExample = source.match(examplesRegex);
  let exampleName = isExample?.groups?.exampleName;
  let isExampleRoot = source === "/examples/README.md";

  if (isExample && !exampleName) {
    throw new Error(`example name not found; path: "${entry.path}"`);
  }

  let filePath = isExample
    ? source.replace(examplesRegex, `/examples/${exampleName}.md`)
    : isExampleRoot
    ? "/examples/index.md"
    : source;

  // TODO: Get actual version
  let version = "v6";

  let contentToProcess = data.toc === false ? content : "## toc\n" + content;

  let html = hasContent
    ? await processMarkdown(contentToProcess, {
        linkOriginPath: path ? `docs/${lang}/${version}` + path : undefined,
      })
    : "";

  return {
    attributes: {
      disabled: data.disabled ?? false,
      toc: data.toc,
      hidden: data.hidden ?? false,
      siblingLinks: data.siblingLinks ?? false,
      title: title,
      order: data.order,
      description: data.description,
      published: data.published,
    },
    html: html.toString(),
    title,
    path: filePath,
    source: entry.path,
    md: content,
    hasContent,
    lang,
  };
}

async function processDocs(entries: Entry[]) {
  return Promise.all(entries.map((entry) => processDoc(entry)));
}

export { processDoc, processDocs, ProcessedDoc, Attributes };

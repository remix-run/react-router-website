import parseAttributes from "gray-matter";
import { processMarkdown } from "@ryanflorence/md";
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
  md: string;
  lang: string;
  hasContent: boolean;
}

async function processDoc(entry: Entry): Promise<ProcessedDoc> {
  let { data, content } = parseAttributes(entry.content!);
  let hasContent = content.trim() !== "";

  let path = entry.path.replace(/^\/docs/, "");
  let title = data.title || path;
  let html = hasContent
    ? await processMarkdown(data.toc === false ? content : "## toc\n" + content)
    : "";

  let langMatch = path.match(/^\/_i18n\/(?<lang>[a-z]{2})\//);

  let lang = langMatch?.groups?.lang ?? "en";

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
    path,
    md: content,
    hasContent,
    lang,
  };
}

async function processDocs(entries: Entry[]) {
  return Promise.all(entries.map((entry) => processDoc(entry)));
}

export { processDoc, processDocs, ProcessedDoc, Attributes };

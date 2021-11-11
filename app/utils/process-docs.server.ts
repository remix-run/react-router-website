import parseAttributes from "gray-matter";
import { File, processMarkdown } from "@mcansh/undoc";

let SITE_URL = process.env.SITE_URL;

if (!SITE_URL) {
  throw new Error("SITE_URL env var not set");
}

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

export interface Entry {
  path: string;
  content: string;
  lang: string;
}

async function processDoc(entry: Entry): Promise<ProcessedDoc> {
  let { data, content } = parseAttributes(entry.content!);
  let hasContent = content.trim() !== "";

  let title = data.title || entry.path;

  // TODO: Get actual version
  let version = "v6";

  let contentToProcess = data.toc === false ? content : "## toc\n" + content;

  let html = hasContent
    ? await processMarkdown(new URL(SITE_URL), contentToProcess, {
        linkOriginPath: `docs/${entry.lang}/${version}` + entry.path,
      })
    : "";

  return {
    attributes: {
      disabled: data.disabled ?? false,
      toc: data.toc,
      hidden: data.hidden ?? false,
      siblingLinks: data.siblingLinks ?? false,
      title: data.title,
      order: data.order,
      description: data.description,
      published: data.published,
    },
    html: html.toString(),
    title,
    path: entry.path,
    source: entry.path,
    md: content,
    hasContent,
    lang: entry.lang,
  };
}

export { processDoc, ProcessedDoc, Attributes };

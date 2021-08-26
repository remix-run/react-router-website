import parseAttributes from "gray-matter";
import { processMarkdown } from "@ryanflorence/md";
import type { Entry } from "./get-docs.server";

async function processDoc(entry: Entry): Promise<{
  attributes: { [key: string]: string };
  html: string;
  title: string;
  path: string;
  md: string;
  lang: string;
}> {
  let { data, content } = parseAttributes(entry.content!);

  let path = entry.path.replace(/^\/docs/, "");
  let title = data.title || path;
  let html = await processMarkdown(`## toc\n\n${content}`);
  let langMatch = path.match(/^\/_i18n\/(?<lang>[a-z]{2})\//);

  let lang = langMatch?.groups?.lang ?? "en";

  return {
    attributes: data,
    html: html.toString(),
    title,
    path,
    md: content,
    lang,
  };
}

async function processDocs(entries: Entry[]) {
  return Promise.all(entries.map((entry) => processDoc(entry)));
}

export { processDoc, processDocs };

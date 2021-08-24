import parseAttributes from "gray-matter";
import { processMarkdown } from "@ryanflorence/md";
import { Entry } from "./get-docs.server";

async function processDoc(entry: Entry) {
  let { data, content } = parseAttributes(entry.content!);

  let path = entry.path.replace(/^\/docs/, "");
  let title = data.title || path;
  let html = await processMarkdown(`## toc\n\n${content}`);

  return {
    attributes: data,
    html: html.toString(),
    title,
    path,
    md: content,
  };
}

async function processDocs(entries: Entry[]) {
  return Promise.all(entries.map((entry) => processDoc(entry)));
}

export { processDoc, processDocs };

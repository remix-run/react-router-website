import { type MiddlewareFunction } from "react-router";

import { CACHE_CONTROL } from "~/http";
import { getRepoDoc, getRepoTags } from "./index";
import { getLatestVersion } from "./tags";
import { buildDocPaths, resolveRef } from "./doc-url-parser";
import { estimateTokens, prefersMarkdown } from "./markdown-negotiation";

export const handleMarkdownRequest: MiddlewareFunction = async ({
  request,
  url,
}) => {
  if (request.method !== "GET" && request.method !== "HEAD") return;

  let viaExtension = url.pathname.endsWith(".md");
  let wantsMarkdown =
    viaExtension || prefersMarkdown(request.headers.get("accept"));
  if (!wantsMarkdown) return;

  let tags = await getRepoTags().catch(() => undefined);
  if (!tags) return;

  let latestVersion = getLatestVersion(tags);
  let splat = url.pathname.replace(/^\//, "");
  let { ref, refParam } = resolveRef(splat, latestVersion);
  let { slug } = buildDocPaths(url.pathname, splat, ref, refParam);

  let doc = await getRepoDoc(ref, slug).catch(() => undefined);
  if (!doc) return;

  let headers = new Headers({
    "Content-Type": "text/markdown; charset=utf-8",
    "Cache-Control": CACHE_CONTROL.doc,
    "X-Markdown-Tokens": String(estimateTokens(doc.md)),
  });
  if (!viaExtension) headers.append("Vary", "Accept");

  return new Response(request.method === "HEAD" ? null : doc.md, {
    status: 200,
    headers,
  });
};

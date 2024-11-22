import { getRepoDoc } from "~/modules/gh-docs/.server";
import { CACHE_CONTROL } from "~/http";
import { seo } from "~/seo";
import semver from "semver";

import type { HeadersArgs } from "react-router";

import { getDocTitle, getDocsSearch, getRobots } from "~/ui/meta";
import { DocLayout } from "~/components/doc-layout";
import type { Route } from "./+types/doc";

export { ErrorBoundary } from "~/components/doc-error-boundary";

export let loader = async ({ request, params }: Route.LoaderArgs) => {
  let url = new URL(request.url);
  let splat = params["*"];
  let firstSegment = splat?.split("/")[0];
  let refParam = params.ref
    ? params.ref
    : firstSegment === "dev" ||
      firstSegment === "local" ||
      semver.valid(firstSegment)
    ? firstSegment
    : undefined;

  let ref = refParam || "main";

  let slug = url.pathname.endsWith("/changelog")
    ? "CHANGELOG"
    : url.pathname.endsWith("/home")
    ? `docs/index`
    : refParam
    ? // remove the refParam
      `docs/${params["*"].split("/").splice(1).join("/")}`
    : `docs/${params["*"]}`;

  try {
    let doc = await getRepoDoc(ref, slug);
    if (!doc) {
      throw new Response("Not Found", { status: 404 });
    }
    return { doc };
  } catch (_) {
    throw new Response("Not Found", { status: 404 });
  }
};

export function headers({ parentHeaders }: HeadersArgs) {
  parentHeaders.set("Cache-Control", CACHE_CONTROL.doc);
  return parentHeaders;
}

export const meta: Route.MetaFunction = ({ error, data, matches, params }) => {
  if (error || !data.doc) {
    return [{ title: "Not Found" }];
  }
  let [rootMatch, docMatch] = matches;
  let doc = docMatch.data;

  let title = getDocTitle(doc, data.doc.attrs.title);

  let [meta] = seo({
    title: title,
    twitter: { title },
    openGraph: { title },
  });

  return [
    ...meta,
    ...getDocsSearch(params.ref),
    ...getRobots(rootMatch.data.isProductionHost, doc),
  ];
};

export default function DocPage({ loaderData }: Route.ComponentProps) {
  return <DocLayout doc={loaderData.doc} />;
}

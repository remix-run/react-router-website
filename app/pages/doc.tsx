import { getRepoDoc } from "~/modules/gh-docs/.server";
import { CACHE_CONTROL } from "~/http";
import { seo } from "~/seo";
import semver from "semver";

import type { HeadersArgs } from "react-router";

import { getDocTitle, getSearchMetaTags } from "~/ui/meta";
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
          `docs/${params["*"].replace(`${refParam}/`, "")}`
        : `docs/${params["*"]}`;

  try {
    let doc = await getRepoDoc(ref, slug);
    if (!doc) {
      throw new Response("Not Found", { status: 404 });
    }
    return { doc };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_) {
    throw new Response("Not Found", { status: 404 });
  }
};

export function headers({ parentHeaders }: HeadersArgs) {
  parentHeaders.set("Cache-Control", CACHE_CONTROL.doc);
  return parentHeaders;
}

export function meta({ error, data, matches, location }: Route.MetaArgs) {
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

  // a bit hacky but avoids double indexing v6 docs
  //
  // ✅ "/6.29.0/start/examples"
  // ❌ "/en/6.29.0/start/examples"
  // let docSearchVersion = location.pathname.startsWith("/en/")
  //   ? null
  //   : doc.header.docSearchVersion;

  let docSearchVersion = doc.header.docSearchVersion;

  return [
    ...meta,
    ...getSearchMetaTags(rootMatch.data.isProductionHost, docSearchVersion),
  ];
}

export default function DocPage({ loaderData }: Route.ComponentProps) {
  return <DocLayout doc={loaderData.doc} />;
}

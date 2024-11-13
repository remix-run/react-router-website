import invariant from "tiny-invariant";
import { useLoaderData } from "react-router";

import { getRepoDoc } from "~/modules/gh-docs/.server";
import { CACHE_CONTROL } from "~/http";
import { seo } from "~/seo";

import type {
  LoaderFunctionArgs,
  MetaFunction,
  HeadersArgs,
} from "react-router";

import {
  getDocMatchData,
  getDocTitle,
  getDocsSearch,
  getRobots,
  getRootMatchData,
} from "~/ui/meta";
import { DocLayout } from "~/components/doc-layout";

export { ErrorBoundary } from "~/components/doc-error-boundary";

export let loader = async ({ params }: LoaderFunctionArgs) => {
  let ref = params.ref || "main";
  let slug = params["*"]?.endsWith("/changelog")
    ? "CHANGELOG"
    : `docs/${params["*"] || "index"}`;

  let doc = await getRepoDoc(ref, slug);
  if (!doc) throw new Response("Not Found", { status: 404 });
  return { doc };
};

export function headers({ parentHeaders }: HeadersArgs) {
  parentHeaders.set("Cache-Control", CACHE_CONTROL.doc);
  return parentHeaders;
}

export const meta: MetaFunction<typeof loader> = ({
  data,
  matches,
  params,
}) => {
  invariant(data, "Expected data");

  let doc = getDocMatchData(matches);
  let rootMatch = getRootMatchData(matches);

  let title = getDocTitle(doc, data.doc.attrs.title);

  let [meta] = seo({
    title: title,
    twitter: { title },
    openGraph: { title },
  });

  return [
    ...meta,
    ...getDocsSearch(params.ref),
    ...getRobots(rootMatch.isProductionHost, doc),
  ];
};

export default function DocPage() {
  let { doc } = useLoaderData<typeof loader>();
  return <DocLayout doc={doc} />;
}

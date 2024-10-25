import type { HeadersArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, type MetaFunction } from "@remix-run/react";
import invariant from "tiny-invariant";

import { CACHE_CONTROL } from "~/http";
import { seo } from "~/seo";
import { getRepoReferenceDoc } from "~/modules/gh-docs/.server";

import {
  getApiMatchData,
  getDocsSearch,
  getRobots,
  getRootMatchData,
  getDocTitle,
} from "~/ui/meta";
import { DocLayout } from "~/components/doc-layout";

export { ErrorBoundary } from "~/components/doc-error-boundary";

export async function loader({ params }: LoaderFunctionArgs) {
  let { ref = "main", pkg, "*": splat } = params;
  invariant(pkg, "expected `params.pkg`");
  invariant(splat, "expected `*` params");
  let pkgName = pkg === "react-router" ? pkg : `@react-router/${pkg}`;
  let doc = await getRepoReferenceDoc(ref, pkgName, splat);
  if (!doc) throw new Response("", { status: 404 });
  return { doc };
}

export function headers({ parentHeaders }: HeadersArgs) {
  parentHeaders.set("Cache-Control", CACHE_CONTROL.doc);
  return parentHeaders;
}

// Note: this is basically identically to guide.tsx meta
export const meta: MetaFunction<typeof loader> = ({
  data,
  matches,
  params,
}) => {
  invariant(data, "Expected data");

  let api = getApiMatchData(matches);
  let rootMatch = getRootMatchData(matches);

  let title = getDocTitle(api, data.doc.attrs.title);

  let [meta] = seo({
    title: title,
    twitter: { title },
    openGraph: { title },
  });

  return [
    ...meta,
    ...getDocsSearch(params.ref),
    ...getRobots(rootMatch.isProductionHost, api),
  ];
};

export default function ReferenceDoc() {
  let { doc } = useLoaderData<typeof loader>();
  return <DocLayout doc={doc} />;
}

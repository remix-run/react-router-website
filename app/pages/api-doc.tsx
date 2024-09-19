import type { HeadersArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, type MetaFunction } from "@remix-run/react";
import * as React from "react";
import invariant from "tiny-invariant";

import { CACHE_CONTROL } from "~/http";
import { seo } from "~/seo";
import { getRepoReferenceDoc } from "~/modules/gh-docs/.server";
import { useDelegatedReactRouterLinks } from "~/ui/delegate-markdown-links";

import { LargeOnThisPage, SmallOnThisPage } from "~/components/on-this-page";

import {
  getApiMatchData,
  getDocsSearch,
  getRobots,
  getRootMatchData,
  getDocTitle,
} from "~/ui/meta";

export { ErrorBoundary } from "~/components/doc-error-boundary";

export async function loader({ params }: LoaderFunctionArgs) {
  let { ref = "main", pkg, "*": splat } = params;
  invariant(pkg, "expected `params.pkg`");
  invariant(splat, "expected `*` params");
  let doc = await getRepoReferenceDoc(ref, pkg, splat);
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
  let ref = React.useRef<HTMLDivElement>(null);
  useDelegatedReactRouterLinks(ref);

  return (
    <div className="xl:flex xl:w-full xl:justify-between xl:gap-8">
      {doc.headings.length > 3 ? (
        <>
          <SmallOnThisPage doc={doc} />
          <LargeOnThisPage doc={doc} />
        </>
      ) : (
        <div className="hidden xl:order-1 xl:block xl:w-56 xl:flex-shrink-0" />
      )}
      <div className="min-w-0 px-4 pt-12 xl:mr-4 xl:flex-grow xl:pl-0 xl:pt-20">
        <div ref={ref} className="markdown w-full max-w-3xl pb-[33vh]">
          <div
            className="md-prose"
            dangerouslySetInnerHTML={{ __html: doc.html }}
          />
        </div>
      </div>
    </div>
  );
}

import invariant from "tiny-invariant";
import * as React from "react";
import { useLoaderData } from "@remix-run/react";

import { getRepoDoc } from "~/modules/gh-docs/.server";
import { CACHE_CONTROL } from "~/http";
import { seo } from "~/seo";
import { useDelegatedReactRouterLinks } from "~/ui/delegate-markdown-links";
import { LargeOnThisPage, SmallOnThisPage } from "~/components/on-this-page";

import type {
  LoaderFunctionArgs,
  MetaFunction,
  HeadersArgs,
} from "@remix-run/node";

import {
  getGuideMatchData,
  getDocTitle,
  getDocsSearch,
  getRobots,
  getRootMatchData,
} from "~/ui/meta";

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

  let guides = getGuideMatchData(matches);
  let rootMatch = getRootMatchData(matches);

  let title = getDocTitle(guides, data.doc.attrs.title);

  let [meta] = seo({
    title: title,
    twitter: { title },
    openGraph: { title },
  });

  return [
    ...meta,
    ...getDocsSearch(params.ref),
    ...getRobots(rootMatch.isProductionHost, guides),
  ];
};

export default function DocPage() {
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

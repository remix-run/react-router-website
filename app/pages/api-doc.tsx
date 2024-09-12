import type { HeadersArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, type MetaFunction } from "@remix-run/react";
import * as React from "react";
import invariant from "tiny-invariant";

import { CACHE_CONTROL } from "~/http";
import type { loader as rootLoader } from "~/root";
import type { loader as apiLoader } from "~/pages/api-layout";
import { seo } from "~/seo";
import { getRepoReferenceDoc } from "~/modules/gh-docs/.server";
import { useDelegatedReactRouterLinks } from "~/ui/delegate-markdown-links";

import { LargeOnThisPage, SmallOnThisPage } from "~/components/on-this-page";

export { ErrorBoundary } from "../pages/guide";

export async function loader({ params, request }: LoaderFunctionArgs) {
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
export const meta: MetaFunction<
  typeof loader,
  {
    root: typeof rootLoader;
    // custom route id "api" in vite config
    api: typeof apiLoader;
  }
> = ({ data, matches, params }) => {
  invariant(data, "Expected data");

  let api = matches.find((m) => m.id === "api");
  invariant(api, `Expected api parent route`);

  let { releaseBranch, branches, currentGitHubRef } = api.data.header;

  let titleRef =
    currentGitHubRef === releaseBranch
      ? ""
      : branches.includes(currentGitHubRef)
      ? `(${currentGitHubRef} branch)`
      : currentGitHubRef.startsWith("v")
      ? currentGitHubRef
      : `v${currentGitHubRef}`;

  let title = `${data.doc.attrs.title} ${titleRef}`;

  let rootMatch = matches.find((m) => m.id === "root");
  invariant(rootMatch, "Expected root match");

  // seo: only want to index the main branch
  let isMainBranch = currentGitHubRef === releaseBranch;
  let robots =
    rootMatch.data.isProductionHost && isMainBranch
      ? "index,follow"
      : "noindex,nofollow";

  let [meta] = seo({
    title: title,
    twitter: { title },
    openGraph: { title },
  });

  return [
    ...meta,
    { name: "docsearch:language", content: "en" },
    { name: "docsearch:version", content: params.ref || "v6" },
    { name: "robots", content: robots },
    { name: "googlebot", content: robots },
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

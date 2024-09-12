import invariant from "tiny-invariant";
import * as React from "react";
import {
  isRouteErrorResponse,
  useLoaderData,
  useParams,
  useRouteError,
} from "@remix-run/react";

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
import { type loader as rootLoader } from "~/root";
import { type loader as guidesLoader } from "./guides-layout";

export let loader = async ({ params, request }: LoaderFunctionArgs) => {
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

// Note: this is basically identically to api-doc.tsx meta
export const meta: MetaFunction<
  typeof loader,
  {
    root: typeof rootLoader;
    // custom route id "guides" in vite config
    guides: typeof guidesLoader;
  }
> = ({ data, matches, params }) => {
  invariant(data, "Expected data");

  let api = matches.find((m) => m.id === "guides");
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
export function ErrorBoundary() {
  let error = useRouteError();
  let params = useParams();

  if (isRouteErrorResponse(error)) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center">
        <h1 className="text-9xl font-bold">404</h1>
        <p className="text-lg">
          There is no doc for <i className="text-gray-500">{params["*"]}</i>
        </p>
      </div>
    );
  }

  throw error;
}

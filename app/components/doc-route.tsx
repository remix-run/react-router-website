import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import * as React from "react";
import { json, Response } from "@remix-run/node";
import { useLoaderData, useParams } from "@remix-run/react";
import invariant from "tiny-invariant";
import type { Doc } from "~/modules/gh-docs";
import { getRepoDoc } from "~/modules/gh-docs";
import { CACHE_CONTROL, whyDoWeNotHaveGoodMiddleWareYetRyan } from "~/http";
import { seo } from "~/seo";
import { useDelegatedReactRouterLinks } from "./delegate-markdown-links";

type LoaderData = { doc: Doc };

export let loader: LoaderFunction = async ({ params, request }) => {
  await whyDoWeNotHaveGoodMiddleWareYetRyan(request);

  invariant(params.ref, "expected `ref` params");

  let doc = await getRepoDoc(params.ref, params["*"] || "index");
  if (!doc) {
    throw new Response("", { status: 404 });
  }

  return json<LoaderData>(
    { doc },
    { headers: { "Cache-Control": CACHE_CONTROL.doc } }
  );
};

export function headers() {
  return {
    "Cache-Control": CACHE_CONTROL.doc,
    Vary: "Cookie",
  };
}

export let meta: MetaFunction = ({ data, parentsData }) => {
  if (!data) return { title: "Not Found" };
  let parentData = parentsData["routes/$lang.$ref"];
  if (!parentData) return {};

  let rootData = parentsData["root"];

  let { doc } = data;
  let { latestVersion, releaseBranch, branches, currentGitHubRef } = parentData;

  let titleRef =
    currentGitHubRef === releaseBranch
      ? `v${latestVersion}`
      : branches.includes(currentGitHubRef)
      ? `(${currentGitHubRef} branch)`
      : currentGitHubRef.startsWith("v")
      ? currentGitHubRef
      : `v${currentGitHubRef}`;

  let title = doc.attrs.title + ` ${titleRef}`;

  // seo: only want to index the main branch
  let isMainBranch = currentGitHubRef === releaseBranch;

  let robots =
    rootData.isProductionHost && isMainBranch
      ? "index,follow"
      : "noindex,nofollow";

  let [meta] = seo({
    title: title,
    twitter: { title },
    openGraph: { title },
  });

  return {
    ...meta,
    robots: robots,
    googlebot: robots,
  };
};

export default function DocPage() {
  let { doc } = useLoaderData<LoaderData>();
  let ref = React.useRef<HTMLDivElement>(null);
  useDelegatedReactRouterLinks(ref);
  return (
    <div
      ref={ref}
      className="markdown pb-[33vh]"
      dangerouslySetInnerHTML={{ __html: doc.html }}
    />
  );
}

export function CatchBoundary() {
  let params = useParams();
  return (
    <div className="flex h-[50vh] flex-col items-center justify-center">
      <h1 className="text-9xl font-bold">404</h1>
      <p className="text-lg">
        There is no doc for <i className="text-gray-500">{params["*"]}</i>
      </p>
    </div>
  );
}

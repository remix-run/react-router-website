import type { LoaderFunction } from "@remix-run/node";
import * as React from "react";
import { json, Response } from "@remix-run/node";
import { useLoaderData, useParams } from "@remix-run/react";
import invariant from "tiny-invariant";
import type { Doc } from "~/modules/gh-docs";
import { getRepoDoc } from "~/modules/gh-docs";
import {
  CACHE_CONTROL,
  isProductionHost,
  whyDoWeNotHaveGoodMiddleWareYetRyan,
} from "~/http";
import { seo } from "~/seo";
import { useDelegatedReactRouterLinks } from "./delegate-markdown-links";

type LoaderData = { doc: Doc; isProductionApp: boolean };

export let loader: LoaderFunction = async ({ params, request }) => {
  await whyDoWeNotHaveGoodMiddleWareYetRyan(request);

  invariant(params.ref, "expected `ref` params");

  let doc = await getRepoDoc(params.ref, params["*"] || "index");
  if (!doc) {
    throw new Response("", { status: 404 });
  }

  // Would rather do this once in root.tsx but `seo` is kinda funny, need to
  // think about it a bit, but I'm thinking it shouldn't automatically add
  // robots stuff unless you explicitly ask for it in the default or `set()`
  // call.
  let isProductionApp = isProductionHost(request);

  return json<LoaderData>(
    { doc, isProductionApp },
    { headers: { "Cache-Control": CACHE_CONTROL.doc } }
  );
};

export function headers() {
  return {
    "Cache-Control": CACHE_CONTROL.doc,
    Vary: "Cookie",
  };
}

export function meta({ data }: { data?: LoaderData }) {
  if (!data) return { title: "Not Found" };
  let { doc, isProductionApp } = data;
  let title = doc.attrs.title;
  let [meta] = seo({
    title: title,
    twitter: { title },
    openGraph: { title },
    robots: { noindex: !isProductionApp },
  });
  return meta;
}

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

import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import type { Doc } from "~/gh-docs";
import { getRepoDoc } from "~/gh-docs";
import { CACHE_CONTROL, isProductionHost } from "~/http";
import { seo } from "~/seo";

type LoaderData = { doc: Doc; isProductionApp: boolean };

export let loader: LoaderFunction = async ({ params, request }) => {
  invariant(params.ref, "expected `ref` params");

  let doc = await getRepoDoc(params.ref, params["*"] || "index");
  if (!doc) throw new Response("", { status: 404 });

  // Would rather do this once in root.tsx but `seo` is kinda funny, need to
  // think about it a bit, but I'm thinking it shouldn't automatically add
  // robots stuff unless you explicitly ask for it in the default or `set()`
  // call.
  let isProductionApp = isProductionHost(request);

  return json<LoaderData>(
    { doc, isProductionApp },
    {
      headers: { "Cache-Control": CACHE_CONTROL.doc },
    }
  );
};

export function headers() {
  return {
    "Cache-Control": CACHE_CONTROL.doc,
    Vary: "Cookie",
  };
}

export function meta({ data }: { data?: LoaderData }) {
  invariant(data, `expected loader data for meta tags`);
  let { doc, isProductionApp } = data;
  let title = doc.attrs.title + " | React Router";
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
  return (
    <div className="markdown" dangerouslySetInnerHTML={{ __html: doc.html }} />
  );
}

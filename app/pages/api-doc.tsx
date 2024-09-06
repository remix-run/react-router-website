import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, type MetaFunction } from "@remix-run/react";
import * as React from "react";
import invariant from "tiny-invariant";

import { CACHE_CONTROL, middlewares } from "~/http";
import type { loader as rootLoader } from "~/root";
import { seo } from "~/seo";
import { getRepoReferenceDoc } from "~/modules/gh-docs/.server";
import { useDelegatedReactRouterLinks } from "~/ui/delegate-markdown-links";

import { LargeOnThisPage, SmallOnThisPage } from "../pages/guide";

export { ErrorBoundary } from "../pages/guide";

export async function loader({ params, request }: LoaderFunctionArgs) {
  await middlewares(request);

  let { ref = "main", pkg, "*": splat } = params;
  invariant(pkg, "expected `params.pkg`");
  invariant(splat, "expected `*` params");

  let doc = await getRepoReferenceDoc(ref, pkg, splat);

  if (!doc) throw new Response("", { status: 404 });

  return json({ doc }, { headers: { "Cache-Control": CACHE_CONTROL.doc } });
}

export const headers: HeadersFunction = ({ loaderHeaders }) => {
  // Inherit the caching headers from the loader so we don't cache 404s
  let headers = new Headers(loaderHeaders);
  headers.set("Vary", "Cookie");
  return headers;
};

// export const meta: MetaFunction<
//   typeof loader,
//   {
//     root: typeof rootLoader;
//     "routes/api_.$ref": typeof any;
//   }
// > = ({ data, matches, params }) => {
//   if (!data) return [{ title: "Not Found" }];
//   let parentMatch = matches.find((m) => m.id === "routes/api_.$ref");
//   let parentData = parentMatch ? parentMatch.data : undefined;
//   if (!parentData || !("latestVersion" in parentData)) return [];

//   let rootMatch = matches.find((m) => m.id === "root");
//   let rootData = rootMatch ? rootMatch.data : undefined;

//   let { latestVersion, releaseBranch, branches, currentGitHubRef } = parentData;

//   let titleRef =
//     currentGitHubRef === releaseBranch
//       ? `v${latestVersion}`
//       : branches.includes(currentGitHubRef)
//       ? `(${currentGitHubRef} branch)`
//       : currentGitHubRef.startsWith("v")
//       ? currentGitHubRef
//       : `v${currentGitHubRef}`;

//   let title = data?.doc?.attrs?.title
//     ? `${data.doc.attrs.title} ${titleRef}`
//     : "";

//   // seo: only want to index the main branch
//   let isMainBranch = currentGitHubRef === releaseBranch;

//   let [meta] = seo({
//     title: title,
//     twitter: { title },
//     openGraph: { title },
//   });

//   let robots =
//     rootData &&
//     "isProductionHost" in rootData &&
//     rootData.isProductionHost &&
//     isMainBranch
//       ? "index,follow"
//       : "noindex,nofollow";

//   return [
//     ...meta,
//     { name: "docsearch:language", content: params.lang || "en" },
//     { name: "docsearch:version", content: params.ref || "v6" },
//     { name: "robots", content: robots },
//     { name: "googlebot", content: robots },
//   ];
// };

export default function ReferenceDoc() {
  let { doc } = useLoaderData<typeof loader>();
  invariant(doc, "expected `doc`");
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

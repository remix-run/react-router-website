import type {
  LoaderFunctionArgs,
  SerializeFrom,
  MetaFunction,
} from "@remix-run/node";
import * as React from "react";
import { json } from "@remix-run/node";
import {
  isRouteErrorResponse,
  useLoaderData,
  useParams,
  useRouteError,
} from "@remix-run/react";
import invariant from "tiny-invariant";
import type { Doc } from "~/modules/gh-docs";
import { getRepoDoc } from "~/modules/gh-docs";
import { CACHE_CONTROL, whyDoWeNotHaveGoodMiddleWareYetRyan } from "~/http";
import { seo } from "~/seo";
import { useDelegatedReactRouterLinks } from "./delegate-markdown-links";
import iconsHref from "~/icons.svg";

export let loader = async ({ params, request }: LoaderFunctionArgs) => {
  await whyDoWeNotHaveGoodMiddleWareYetRyan(request);

  invariant(params.ref, "expected `ref` params");

  let doc = await getRepoDoc(params.ref, params["*"] || "index");
  if (!doc) {
    throw new Response("", { status: 404 });
  }

  return json({ doc }, { headers: { "Cache-Control": CACHE_CONTROL.doc } });
};

export function headers() {
  return {
    "Cache-Control": CACHE_CONTROL.doc,
    Vary: "Cookie",
  };
}
export const meta: MetaFunction = () => [];

// export const meta: MetaFunction = ({ data, parentsData }) => {
//   if (!data) return { title: "Not Found" };
//   let parentData = parentsData["routes/$lang.$ref"];
//   if (!parentData) return {};

//   let rootData = parentsData["root"];

//   let { doc } = data;
//   let { latestVersion, releaseBranch, branches, currentGitHubRef } = parentData;

//   let titleRef =
//     currentGitHubRef === releaseBranch
//       ? `v${latestVersion}`
//       : branches.includes(currentGitHubRef)
//       ? `(${currentGitHubRef} branch)`
//       : currentGitHubRef.startsWith("v")
//       ? currentGitHubRef
//       : `v${currentGitHubRef}`;

//   let title = doc.attrs.title + ` ${titleRef}`;

//   // seo: only want to index the main branch
//   let isMainBranch = currentGitHubRef === releaseBranch;

//   let [meta] = seo({
//     title: title,
//     twitter: { title },
//     openGraph: { title },
//   });

//   let robots =
//     rootData.isProductionHost && isMainBranch
//       ? "index,follow"
//       : "noindex,nofollow";

//   return {
//     ...meta,
//     robots: robots,
//     googlebot: robots,
//   };
// };

export default function DocPage() {
  let { doc } = useLoaderData<typeof loader>();
  let ref = React.useRef<HTMLDivElement>(null);
  useDelegatedReactRouterLinks(ref);
  return (
    <div className="xl:flex xl:w-full xl:gap-8">
      {doc.headings.length > 3 ? (
        <>
          <SmallOnThisPage doc={doc} />
          <LargeOnThisPage doc={doc} />
        </>
      ) : (
        <div className="hidden xl:order-1 xl:block xl:w-56 xl:flex-shrink-0" />
      )}
      <div className="px-4 pb-4 pt-8 lg:ml-72 lg:pl-12 lg:pr-8  xl:flex-grow">
        <div
          ref={ref}
          className="markdown w-full pb-[33vh]"
          dangerouslySetInnerHTML={{ __html: doc.html }}
        />
      </div>
    </div>
  );
}

function LargeOnThisPage({ doc }: { doc: SerializeFrom<Doc> }) {
  return (
    <div className="hidden xl:sticky xl:top-28 xl:order-1 xl:mt-10 xl:block xl:max-h-[calc(100vh-10rem)] xl:w-56 xl:flex-shrink-0 xl:self-start xl:overflow-auto">
      <nav className="mb-2 text-sm font-bold">On this page</nav>
      <ul>
        {doc.headings.map((heading, i) => (
          <li key={i}>
            <a
              href={`#${heading.slug}`}
              dangerouslySetInnerHTML={{ __html: heading.html || "" }}
              className="block py-1 text-sm text-gray-400 hover:text-gray-900 active:text-red-brand dark:text-gray-400 dark:hover:text-gray-50 dark:active:text-red-brand"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

function SmallOnThisPage({ doc }: { doc: SerializeFrom<Doc> }) {
  return (
    <details className="group flex h-full flex-col lg:ml-80 lg:mt-4 xl:hidden">
      <summary className="_no-triangle flex cursor-pointer select-none items-center gap-2 border-b border-gray-50 bg-white px-2 py-3 text-sm font-medium hover:bg-gray-50 active:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800 dark:active:bg-gray-700">
        <div className="flex items-center gap-2">
          <svg aria-hidden className="h-5 w-5 group-open:hidden">
            <use href={`${iconsHref}#chevron-r`} />
          </svg>
          <svg aria-hidden className="hidden h-5 w-5 group-open:block">
            <use href={`${iconsHref}#chevron-d`} />
          </svg>
        </div>
        <div className="whitespace-nowrap">On this page</div>
      </summary>
      <ul className="pl-9">
        {doc.headings.map((heading, i) => (
          <li key={i}>
            <a
              href={`#${heading.slug}`}
              dangerouslySetInnerHTML={{ __html: heading.html || "" }}
              className="block py-2 text-sm text-gray-400 hover:text-gray-900 active:text-red-brand dark:text-gray-400 dark:hover:text-gray-50 dark:active:text-red-brand"
            />
          </li>
        ))}
      </ul>
    </details>
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

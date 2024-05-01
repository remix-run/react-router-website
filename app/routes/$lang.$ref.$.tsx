import type {
  LoaderFunctionArgs,
  SerializeFrom,
  MetaFunction,
  HeadersFunction,
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
import type { Doc } from "~/modules/gh-docs/.server";
import { getRepoDoc } from "~/modules/gh-docs/.server";
import { CACHE_CONTROL, whyDoWeNotHaveGoodMiddleWareYetRyan } from "~/http";
import { seo } from "~/seo";
import { useDelegatedReactRouterLinks } from "~/ui/delegate-markdown-links";
import iconsHref from "~/icons.svg";
import { type loader as rootLoader } from "~/root";
import { type loader as langRefLoader } from "~/routes/$lang.$ref";
import { Link } from "react-router-dom";

export let loader = async ({ params, request }: LoaderFunctionArgs) => {
  await whyDoWeNotHaveGoodMiddleWareYetRyan(request);

  invariant(params.ref, "expected `ref` params");

  try {
    let slug = params["*"]?.endsWith("/changelog")
      ? "CHANGELOG"
      : `docs/${params["*"] || "index"}`;
    let doc = await getRepoDoc(params.ref, slug);
    if (!doc) throw null;
    return json({ doc }, { headers: { "Cache-Control": CACHE_CONTROL.doc } });
  } catch (_) {
    throw new Response("", { status: 404 });
  }
};

export const headers: HeadersFunction = ({ loaderHeaders }) => {
  // Inherit the caching headers from the loader so we don't cache 404s
  let headers = new Headers(loaderHeaders);
  headers.set("Vary", "Cookie");
  return headers;
};

export const meta: MetaFunction<
  typeof loader,
  {
    root: typeof rootLoader;
    "routes/$lang.$ref": typeof langRefLoader;
  }
> = ({ data, matches }) => {
  if (!data) return [{ title: "Not Found" }];
  let parentMatch = matches.find((m) => m.id === "routes/$lang.$ref");
  let parentData = parentMatch ? parentMatch.data : undefined;
  if (!parentData || !("latestVersion" in parentData)) return [];

  let rootMatch = matches.find((m) => m.id === "root");
  let rootData = rootMatch ? rootMatch.data : undefined;

  let { latestVersion, releaseBranch, branches, currentGitHubRef } = parentData;

  let titleRef =
    currentGitHubRef === releaseBranch
      ? `v${latestVersion}`
      : branches.includes(currentGitHubRef)
      ? `(${currentGitHubRef} branch)`
      : currentGitHubRef.startsWith("v")
      ? currentGitHubRef
      : `v${currentGitHubRef}`;

  let title =
    typeof data === "object" &&
    typeof data.doc === "object" &&
    typeof data.doc.attrs === "object" &&
    typeof data.doc.attrs.title === "string"
      ? data.doc.attrs.title + ` ${titleRef}`
      : "";

  // seo: only want to index the main branch
  let isMainBranch = currentGitHubRef === releaseBranch;

  let [meta] = seo({
    title: title,
    twitter: { title },
    openGraph: { title },
  });

  let robots =
    rootData &&
    "isProductionHost" in rootData &&
    rootData.isProductionHost &&
    isMainBranch
      ? "index,follow"
      : "noindex,nofollow";

  return [
    ...meta,
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

function LargeOnThisPage({ doc }: { doc: SerializeFrom<Doc> }) {
  return (
    <div className="sticky top-36 order-1 mt-20 hidden max-h-[calc(100vh-9rem)] w-56 flex-shrink-0 self-start overflow-y-auto pb-10 xl:block">
      <nav className="mb-3 flex items-center font-semibold">On this page</nav>
      <ul className="md-toc flex flex-col flex-wrap gap-3 leading-[1.125]">
        {doc.headings.map((heading, i) => (
          <li
            key={i}
            className={heading.headingLevel === "h2" ? "ml-0" : "ml-4"}
          >
            <Link
              to={`#${heading.slug}`}
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
    <details className="group flex flex-col lg:mt-4 xl:hidden">
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
          <li
            key={i}
            className={heading.headingLevel === "h2" ? "ml-0" : "ml-4"}
          >
            <Link
              to={`#${heading.slug}`}
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

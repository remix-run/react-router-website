import * as React from "react";
import type { HeadersArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  type MetaFunction,
  useLoaderData,
  useRouteLoaderData,
} from "@remix-run/react";
import invariant from "tiny-invariant";

import { CACHE_CONTROL } from "~/http";
import { getPackageIndexDoc } from "~/modules/gh-docs/.server";
import { useDelegatedReactRouterLinks } from "~/ui/delegate-markdown-links";
import { LargeOnThisPage, SmallOnThisPage } from "~/components/on-this-page";

import type { loader as parentLoaderData } from "./api-layout";
import { seo } from "~/seo";
import {
  getApiMatchData,
  getDocsSearch,
  getDocTitle,
  getRobots,
  getRootMatchData,
} from "~/ui/meta";

export { ErrorBoundary } from "~/components/doc-error-boundary";

export async function loader({ params }: LoaderFunctionArgs) {
  let { ref = "main", pkg } = params;
  invariant(pkg, "expected `params.pkg`");

  let pkgName = pkg === "react-router" ? pkg : `@react-router/${pkg}`;
  let doc = await getPackageIndexDoc(ref, pkgName);

  return { doc };
}

export const meta: MetaFunction<typeof loader> = ({
  data,
  matches,
  params,
}) => {
  invariant(data, "Expected data");
  invariant(params.pkg, "Expected params.pkg");

  let guides = getApiMatchData(matches);
  let rootMatch = getRootMatchData(matches);
  let title = getDocTitle(guides, params.pkg + " API");

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

export function headers({ parentHeaders }: HeadersArgs) {
  parentHeaders.set("Cache-Control", CACHE_CONTROL.doc);
  return parentHeaders;
}

export default function APIIndex() {
  let { doc } = useLoaderData<typeof loader>();
  let { menu } = useRouteLoaderData<typeof parentLoaderData>("api") ?? {};

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

          {!!menu && (
            <div className="md-prose mt-8">
              <h2 id="_index">Index</h2>
              {menu.map((category) => (
                <React.Fragment key={category.filename}>
                  <h3 id={category.filename}>{category.attrs.title}</h3>
                  <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {category.children.map((item) => (
                      <li key={item.filename}>
                        <a href={item.filename}>{item.attrs.title}</a>
                      </li>
                    ))}
                  </ul>
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

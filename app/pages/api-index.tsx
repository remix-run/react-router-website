import * as React from "react";
import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useRouteLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";

import { CACHE_CONTROL, middlewares } from "~/http";
import { getPackageIndexDoc } from "~/modules/gh-docs/.server";
import { useDelegatedReactRouterLinks } from "~/ui/delegate-markdown-links";
import { LargeOnThisPage, SmallOnThisPage } from "./guide";
import type { loader as parentLoaderData } from "./api-layout";

export { ErrorBoundary } from "./guide";

export async function loader({ params, request }: LoaderFunctionArgs) {
  await middlewares(request);

  let { ref = "main", pkg } = params;
  invariant(pkg, "expected `params.pkg`");

  const doc = await getPackageIndexDoc(ref, pkg);

  return json({ doc }, { headers: { "Cache-Control": CACHE_CONTROL.doc } });
}

export const headers: HeadersFunction = ({ loaderHeaders }) => {
  // Inherit the caching headers from the loader so we don't cache 404s
  let headers = new Headers(loaderHeaders);
  headers.set("Vary", "Cookie");
  return headers;
};

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

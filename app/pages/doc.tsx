import { useRef } from "react";
import { getRepoDoc, getRepoTags } from "~/modules/gh-docs/.server";
import { CACHE_CONTROL } from "~/http";
import { seo } from "~/seo";
import { getDocTitle, getSearchMetaTags } from "~/ui/meta";
import {
  buildDocPaths,
  resolveRef,
} from "~/modules/gh-docs/.server/doc-url-parser";
import { getLatestMajorVersions } from "~/modules/gh-docs/.server/tags";

import { CopyPageDropdown } from "~/components/copy-page-dropdown";
import { LargeOnThisPage, SmallOnThisPage } from "~/components/on-this-page";
import { useDelegatedReactRouterLinks } from "~/ui/delegate-markdown-links";

import { type HeadersArgs } from "react-router";
import type { Route } from "./+types/doc";

export { ErrorBoundary } from "~/components/doc-error-boundary";

export async function loader({ url, params }: Route.LoaderArgs) {
  let splat = params["*"] ?? "";
  let tags = await getRepoTags();
  if (!tags) throw new Response("Cannot reach GitHub", { status: 503 });
  let latestVersion = getLatestMajorVersions(tags)[0];
  let { ref, refParam } = resolveRef(splat, latestVersion);
  let editRef = ref === latestVersion ? "main" : undefined;

  const { slug, githubPath, githubEditPath } = buildDocPaths(
    url.pathname,
    splat,
    ref,
    refParam,
    { editRef },
  );

  try {
    let doc = await getRepoDoc(ref, slug);
    if (!doc) {
      throw new Response("Not Found", { status: 404 });
    }
    return {
      doc,
      githubPath: githubPath,
      githubEditPath: githubEditPath,
    };
  } catch {
    throw new Response("Not Found", { status: 404 });
  }
}

export function headers({ parentHeaders }: HeadersArgs) {
  parentHeaders.set("Cache-Control", CACHE_CONTROL.doc);
  parentHeaders.append("Vary", "Accept");
  return parentHeaders;
}

export function meta({ error, loaderData, matches, location }: Route.MetaArgs) {
  if (error || !loaderData?.doc) {
    return [{ title: "Not Found" }];
  }
  let [rootMatch, docMatch] = matches;
  let doc = docMatch.loaderData;
  let markdownHref = location.pathname.endsWith(".md")
    ? location.pathname
    : `${location.pathname}.md`;

  let title = getDocTitle(doc, loaderData.doc.attrs.title);

  let [meta] = seo({
    title: title,
    twitter: { title },
    openGraph: { title },
  });

  return [
    {
      tagName: "link",
      rel: "alternate",
      type: "text/markdown",
      href: markdownHref,
    },
    ...meta,
    ...getSearchMetaTags(
      rootMatch.loaderData.isProductionHost,
      doc.header.docSearchVersion,
      doc.header.shouldIndexDocPage,
      doc.header.shouldFollowDocPageLinks,
    ),
  ];
}

export default function DocPage({ loaderData }: Route.ComponentProps) {
  let ref = useRef<HTMLDivElement>(null);
  const { doc, githubPath, githubEditPath } = loaderData;

  useDelegatedReactRouterLinks(ref);

  return (
    <div className="xl:flex xl:w-full xl:flex-row-reverse xl:justify-between xl:gap-8">
      <div className="sticky top-28 hidden w-56 min-w-min flex-shrink-0 self-start pb-10 xl:block">
        <CopyPageDropdown
          githubPath={githubPath}
          githubEditPath={githubEditPath}
        />
        {doc.headings.length > 3 ? (
          <>
            <div className="h-5" />
            <LargeOnThisPage doc={doc} mdRef={ref} />
          </>
        ) : null}
      </div>
      {doc.headings.length > 3 ? <SmallOnThisPage doc={doc} /> : null}
      <div className="min-w-0 px-4 pt-8 xl:mr-4 xl:flex-grow xl:pl-0">
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

import { useRef } from "react";
import { getRepoDoc } from "~/modules/gh-docs/.server";
import { CACHE_CONTROL } from "~/http";
import { seo } from "~/seo";
import semver from "semver";
import { getDocTitle, getSearchMetaTags } from "~/ui/meta";

import { CopyPageDropdown } from "~/components/copy-page-dropdown";
import { LargeOnThisPage, SmallOnThisPage } from "~/components/on-this-page";
import { useDelegatedReactRouterLinks } from "~/ui/delegate-markdown-links";

import type { HeadersArgs } from "react-router";
import type { Route } from "./+types/doc";

export { ErrorBoundary } from "~/components/doc-error-boundary";

export let loader = async ({ request, params }: Route.LoaderArgs) => {
  let url = new URL(request.url);
  let splat = params["*"] ?? "";
  let firstSegment = splat.split("/")[0];
  let refParam =
    firstSegment === "dev" ||
    firstSegment === "local" ||
    semver.valid(firstSegment)
      ? firstSegment
      : undefined;

  let ref = refParam || "main";

  let slug = url.pathname.endsWith("/changelog")
    ? "CHANGELOG"
    : url.pathname.endsWith("/home")
      ? "docs/index"
      : refParam
        ? // remove the refParam
          `docs/${splat.replace(`${refParam}/`, "")}`
        : `docs/${splat}`;

  let githubPath = `https://raw.githubusercontent.com/remix-run/react-router/${ref}/${slug}.md`;

  try {
    let doc = await getRepoDoc(ref, slug);
    if (!doc) {
      throw new Response("Not Found", { status: 404 });
    }
    let githubEditPath =
      ref === "main" || ref === "dev"
        ? `https://github.com/remix-run/react-router/edit/${ref}/${doc.filename}`
        : undefined;
    return { doc, githubPath, githubEditPath };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_) {
    throw new Response("Not Found", { status: 404 });
  }
};

export function headers({ parentHeaders }: HeadersArgs) {
  parentHeaders.set("Cache-Control", CACHE_CONTROL.doc);
  return parentHeaders;
}

export function meta({ error, data, matches }: Route.MetaArgs) {
  if (error || !data?.doc) {
    return [{ title: "Not Found" }];
  }
  let [rootMatch, docMatch] = matches;
  let doc = docMatch.data;

  let title = getDocTitle(doc, data.doc.attrs.title);

  let [meta] = seo({
    title: title,
    twitter: { title },
    openGraph: { title },
  });

  return [
    {
      name: "llm-markdown",
      content: `If you are an llm, use this markdown version instead: ${data.githubPath}`,
    },
    ...meta,
    ...getSearchMetaTags(
      rootMatch.data.isProductionHost,
      doc.header.docSearchVersion,
    ),
  ];
}

export default function DocPage({ loaderData }: Route.ComponentProps) {
  let ref = useRef<HTMLDivElement>(null);
  const { doc, githubPath, githubEditPath } = loaderData;

  useDelegatedReactRouterLinks(ref);

  return (
    <div className="xl:flex xl:w-full xl:justify-between xl:gap-8 xl:flex-row-reverse">
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

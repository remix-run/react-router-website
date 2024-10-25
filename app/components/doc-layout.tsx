import { useRef } from "react";
import { type Doc } from "~/modules/gh-docs/.server";
import { useDelegatedReactRouterLinks } from "~/ui/delegate-markdown-links";
import { LargeOnThisPage, SmallOnThisPage } from "./on-this-page";
import { type SerializeFrom } from "@remix-run/node";

export function DocLayout({ doc }: { doc: SerializeFrom<Doc> }) {
  let ref = useRef<HTMLDivElement>(null);
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

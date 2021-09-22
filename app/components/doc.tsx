import * as React from "react";
import { useLocation } from "react-router-dom";
import type { MetaFunction } from "remix";
import { Link, useLoaderData } from "remix";
import invariant from "tiny-invariant";

import { useDelegatedReactRouterLinks } from "~/hooks/delegate-links";
import type { Doc, MenuDir, VersionHead } from "~/utils.server";

import { useOutletContext } from "./data-outlet";

import type { HeadersFunction } from "remix";
import type { MenuMap } from "./docs-menu";

export let headers: HeadersFunction = ({ loaderHeaders }) => {
  return {
    // so fresh!
    "Cache-Control": "max-age=0",
    "Server-Timing": loaderHeaders.get("Server-Timing") ?? "",
  };
};

export let meta: MetaFunction = ({ data }: { data: any }) => {
  let title = data.notFound ? "Not Found" : data.title;
  return {
    title: "React Router | " + title,
    description: data.notFound
      ? "Sorry, there is no document here."
      : data.attributes.description || undefined,
  };
};

const PreviousLink: React.VFC = () => {
  let location = useLocation();
  let myPath = location.pathname;
  let menuMap = useOutletContext<MenuMap>();
  let parent = menuMap.get(myPath);
  invariant(parent);

  if (isFirstDoc(parent, myPath)) {
    return <div className="w-12 h-12" />;
  }

  let prevDoc = getPrevDoc(parent, myPath);

  return (
    <div className="w-12 h-12">
      <Link to={prevDoc.path + "/"}>
        <span className="sr-only">Next up! {prevDoc.title}</span>
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-[color:var(--base07)]"
        >
          <path
            d="M26 19L20.75 24L26 29"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Link>
    </div>
  );
};

const NextLink: React.VFC = () => {
  let location = useLocation();
  let myPath = location.pathname;
  let menuMap = useOutletContext<MenuMap>();
  let parent = menuMap.get(myPath);
  invariant(parent);

  if (isLastDoc(parent, myPath)) {
    return null;
  }

  let nextDoc = getNextDoc(parent, myPath);

  return (
    <div className="w-12 h-12">
      <Link to={nextDoc.path + "/"}>
        <span className="sr-only">Next up! {nextDoc.title}</span>
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="[var(--base07)]"
        >
          <path
            d="M26 19L31.25 24L26 29"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Link>
    </div>
  );
};

const SiblingLinks: React.VFC<{ doc: Doc }> = ({ doc }) => {
  let location = useLocation();
  let myPath = location.pathname;
  let menuMap = useOutletContext<MenuMap>();
  let parent = menuMap.get(myPath);

  if (!parent || !parent.attributes.siblingLinks) {
    return null;
  }

  return (
    <div className="border-b border-solid border-[color:var(--base01)] py-5 px-2 flex items-center justify-between">
      <PreviousLink />
      <h1 className="text-[color:var(--base07)] text-center truncate max-w-full">
        {doc.title}
      </h1>
      <NextLink />
    </div>
  );
};

const Page: React.VFC = () => {
  let doc = useLoaderData<Doc>();
  let ref = React.useRef<HTMLDivElement>(null);
  useDelegatedReactRouterLinks(ref);

  if (!doc) {
    return (
      <div>
        <h1>Not Found</h1>
        <p>Sorry, there is no document here.</p>
      </div>
    );
  }

  return (
    <div>
      <SiblingLinks doc={doc} />
      <h1 className="mb-8 text-4xl font-display">{doc.title}</h1>
      <div
        ref={ref}
        className="markdown"
        dangerouslySetInnerHTML={{ __html: doc.html }}
      />
    </div>
  );
};

function getNextDoc(parent: MenuDir, currentPath: string) {
  let myIndex = parent.files.findIndex((file) => file.path === currentPath);
  // we should always have another because we don't render this stuff if
  // we are the last one
  return parent.files[myIndex + 1];
}

function getPrevDoc(parent: MenuDir, currentPath: string) {
  let myIndex = parent.files.findIndex((file) => file.path === currentPath);
  // we should always have another because we don't render this stuff if
  // we are the first one
  return parent.files[myIndex - 1];
}

function isLastDoc(parent: MenuDir, docPath: string) {
  let last = parent.files.slice(-1)[0];
  return last.path === docPath;
}

function isFirstDoc(parent: MenuDir, docPath: string) {
  let first = parent.files[0];
  return first.path === docPath;
}

export { Page };

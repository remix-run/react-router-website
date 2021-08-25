import * as React from "react";
import { MetaFunction, useRouteData } from "remix";
import { useLocation, Link } from "react-router-dom";

import Breadcrumbs from "./breadcrumbs";
import { useOutletContext } from "./data-outlet";

import type { MenuMap } from "../docs/routes/version";
import type { Doc, MenuDir } from "../utils.server";

export let meta: MetaFunction = ({ data }: { data: any }) => {
  let title = data.notFound ? "Not Found" : data.title;
  return {
    title: "React Router | " + title,
    description: data.notFound
      ? "Sorry, there is no document here."
      : data.attributes.description || undefined,
  };
};

const NextLink: React.VFC = () => {
  let location = useLocation();
  let myPath = location.pathname.replace(/\/$/, "");
  let menuMap = useOutletContext<MenuMap>();
  // TODO: add an invariant module
  let parent = menuMap.get(myPath);

  if (parent?.attributes.siblingLinks && !isLastDoc(parent, myPath)) {
    let nextDoc = getNextDoc(parent, myPath);

    return (
      <div className="next-link-container">
        <Link to={nextDoc.path + "/"}>Next up! {nextDoc.title}</Link>
      </div>
    );
  }

  return null;
};

const Page: React.VFC = () => {
  let doc = useRouteData<Doc>();

  if (!doc) {
    return (
      <div className="prose">
        <h1>Not Found</h1>
        <p>Sorry, there is no document here.</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <Breadcrumbs />
        <h1>{doc.title}</h1>
      </div>
      <div
        className="content-container"
        dangerouslySetInnerHTML={{ __html: doc.html }}
      />
      <NextLink />
    </div>
  );
};

function getNextDoc(parent: MenuDir, currentPath: string) {
  let myIndex = parent.files.findIndex((file) => file.path === currentPath);
  // we should always have another because we don't render this stuff if
  // we are the last one
  return parent.files[myIndex + 1];
}

function isLastDoc(
  parent: MenuDir,
  /* trailing slash should be GOOONE */
  docPath: string
) {
  let last = parent.files.slice(-1)[0];
  return last.path === docPath;
}

export { Page };

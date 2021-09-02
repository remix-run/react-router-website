import { MetaFunction, useRouteData } from "remix";
import { useLocation, Link } from "react-router-dom";

import { useOutletContext } from "./data-outlet";

import type { MenuMap } from "~/docs/routes/version";
import type { Doc, MenuDir } from "~/utils.server";

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
  // TODO: add an invariant module
  let parent = menuMap.get(myPath);

  if (parent?.attributes.siblingLinks && !isFirstDoc(parent, myPath)) {
    let prevDoc = getPrevDoc(parent, myPath);

    return (
      <div className="w-12 h-12">
        <Link to={prevDoc.path}>
          <span className="sr-only">Next up! {prevDoc.title}</span>
          <svg
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-[#222222] dark:text-white"
          >
            <path
              d="M26 19L20.75 24L26 29"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </Link>
      </div>
    );
  }

  return <div className="w-12 h-12" />;
};

const NextLink: React.VFC = () => {
  let location = useLocation();
  let myPath = location.pathname;
  let menuMap = useOutletContext<MenuMap>();
  // TODO: add an invariant module
  let parent = menuMap.get(myPath);

  if (parent?.attributes.siblingLinks && !isLastDoc(parent, myPath)) {
    let nextDoc = getNextDoc(parent, myPath);

    return (
      <div className="w-12 h-12">
        <Link to={nextDoc.path}>
          <span className="sr-only">Next up! {nextDoc.title}</span>
          <svg
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-[#222222] dark:text-white"
          >
            <path
              d="M26 19L31.25 24L26 29"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </Link>
      </div>
    );
  }

  return <div className="w-12 h-12" />;
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
    <div className="">
      <div className="border-b border-solid border-[#dbdbdb] dark:border-[#313131] py-5 px-2 flex items-center justify-between">
        <PreviousLink />
        <h1 className="text-[#121212] dark:text-white text-center truncate max-w-full">
          {doc.title}
        </h1>
        <NextLink />
      </div>
      <div
        className="px-6 prose dark:prose-dark"
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

import { Link, useParams } from "@remix-run/react";
import { useDoc } from "~/hooks/use-doc";
import iconsHref from "~/icons.svg";

export function Footer() {
  return (
    <div className="flex justify-between gap-4 border-t border-t-gray-50 py-4 text-sm text-gray-400 dark:border-gray-800">
      <div className="lg:flex lg:items-center">
        <div className="pr-4 lg:pl-4">
          <Link className="hover:underline" to="/brand">
            Brand Assets
          </Link>
        </div>
        <div className="hidden lg:block">•</div>
        <div className="pr-4 lg:pl-4">
          Docs and examples{" "}
          <a
            className="hover:underline"
            href="https://creativecommons.org/licenses/by/4.0/"
          >
            CC 4.0
          </a>
        </div>
      </div>
      <div>
        <EditLink />
      </div>
    </div>
  );
}

function EditLink() {
  let doc = useDoc();
  let params = useParams();
  let isEditableRef = params.ref === "main" || params.ref === "dev";

  if (!doc || !isEditableRef || !doc.filename) {
    return null;
  }

  let editUrl: string;
  let repoUrl = "https://github.com/remix-run/react-router";
  if (doc.filename.match(/\.tsx?$/)) {
    editUrl = `${repoUrl}/edit/${params.ref}/${doc.filename}`;
  } else {
    // TODO: deal with translations when we add them with params.lang
    editUrl = `${repoUrl}/edit/${params.ref}/${doc.slug}.md`;
  }

  return (
    <a className="flex items-center gap-1 hover:underline" href={editUrl}>
      Edit
      <svg aria-hidden className="h-4 w-4">
        <use href={`${iconsHref}#edit`} />
      </svg>
    </a>
  );
}

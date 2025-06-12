import { Link } from "react-router";
import { useDocRouteLoaderData } from "~/hooks/use-doc";
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

      <EditLink />
    </div>
  );
}

function EditLink() {
  let routeData = useDocRouteLoaderData();

  if (!routeData) return null;

  return (
    <a
      className="flex xl:hidden items-center gap-1 hover:underline"
      href={routeData.githubEditPath}
    >
      Edit
      <svg aria-hidden className="h-4 w-4">
        <use href={`${iconsHref}#edit`} />
      </svg>
    </a>
  );
}

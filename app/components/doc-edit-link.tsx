"use client";

import { useDocRouteLoaderData } from "~/hooks/use-doc";
import iconsHref from "~/icons.svg";

export function EditLink() {
  let routeData = useDocRouteLoaderData();
  if (!routeData) return null;

  return (
    <a
      className="flex items-center gap-1 hover:underline xl:hidden"
      href={routeData.githubEditPath}
    >
      Edit
      <svg aria-hidden className="h-4 w-4">
        <use href={`${iconsHref}#edit`} />
      </svg>
    </a>
  );
}

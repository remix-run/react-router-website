import { useMatches } from "react-router";
import type { Route } from "../pages/+types/doc";

type DocRouteData = Route.ComponentProps["loaderData"];

/**
 * Looks for a leaf route match with a `doc` key
 */
export function useDocRouteLoaderData(): DocRouteData | null {
  let data = useMatches().slice(-1)[0]?.loaderData;
  if (!data || !(typeof data === "object") || !("doc" in data)) return null;

  return data as DocRouteData;
}

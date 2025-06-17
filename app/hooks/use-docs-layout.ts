import { useRouteLoaderData } from "react-router";
import type { Route } from "../pages/+types/docs-layout";

export function useDocsLayoutRouteLoaderData() {
  return useRouteLoaderData<Route.ComponentProps["loaderData"]>("docs");
}

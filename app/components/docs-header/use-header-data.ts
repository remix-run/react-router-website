import { useLoaderData, useMatches } from "react-router";
import type { HeaderData } from "./data.server";
import invariant from "tiny-invariant";

export function useHeaderData() {
  let data = useLoaderData() as { header: HeaderData };
  invariant(data && data.header, "Expected `header` in loader data");
  return data.header;
}

export function useHeaderDataFromMatches() {
  let matches = useMatches();
  let match = matches.find((m) => m.id === "docs" || m.id === "v6-docs");
  invariant(match, `Expected "api" or "docs" parent route`);
  invariant(match.data, `Expected data in "api" or "docs" parent route`);
  return (match.data as any).header as HeaderData;
}

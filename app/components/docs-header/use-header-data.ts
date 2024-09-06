import { useLoaderData } from "@remix-run/react";
import type { HeaderData } from "./data.server";
import invariant from "tiny-invariant";

export function useHeaderData() {
  let { header } = useLoaderData() as { header: HeaderData };
  invariant(header, "Expected `header` in loader data");
  return header;
}

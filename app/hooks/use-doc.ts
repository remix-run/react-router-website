import { useMatches } from "@remix-run/react";
import type { Doc } from "~/modules/gh-docs/.server";

/**
 * Looks for a leaf route match with a `doc` key
 */
export function useDoc(): Doc | null {
  let data = useMatches().slice(-1)[0].data;
  if (!data || !(typeof data === "object") || !("doc" in data)) return null;
  return data.doc as Doc;
}

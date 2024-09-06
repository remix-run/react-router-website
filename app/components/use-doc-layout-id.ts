import { useMatches } from "@remix-run/react";

export function useDocLayoutId() {
  let matches = useMatches();
  return matches[matches.length - 2].id;
}

import { useMatches } from "react-router";

export function useDocLayoutId() {
  let matches = useMatches();
  return matches[matches.length - 2].id;
}

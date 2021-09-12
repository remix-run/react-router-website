import { useEffect, useLayoutEffect, useState } from "react";
import { tailwindConfig } from "~/utils/tailwind";

export function useMatchMedia(
  query: string,
  opts: { initialState?: boolean; layoutEffect?: boolean } = {}
) {
  let { initialState = false, layoutEffect } = opts;
  let [matches, setMatches] = useState(initialState);
  (layoutEffect ? useLayoutEffect : useEffect)(() => {
    let mql: MediaQueryList = window.matchMedia(query);
    setMatches(mql.matches);
    mql.addEventListener("change", listener);
    return () => {
      mql.removeEventListener("change", listener);
    };
    function listener(event: MediaQueryListEvent) {
      setMatches(event.matches);
    }
  }, [query]);
  return matches;
}

type Screen = "sm" | "md" | "lg" | "xl" | "2xl";
export function useMatchScreen(
  screen: Screen,
  opts?: { initialState?: boolean; layoutEffect?: boolean }
) {
  let matches = useMatchMedia(
    `screen and (min-width: ${tailwindConfig.theme.screens?.[screen]})`,
    opts
  );
  return matches;
}

import {
  useEffect,
  useState,
  useLayoutEffect as React_useLayoutEffect,
} from "react";

export const canUseDOM = !!(
  typeof window !== "undefined" &&
  window.document &&
  window.document.createElement
);

export const useLayoutEffect = canUseDOM ? React_useLayoutEffect : useEffect;

let hydrating = true;

export function useHydrated() {
  let [hydrated, setHydrated] = useState(() => !hydrating);
  useEffect(() => {
    hydrating = false;
    setHydrated(true);
  }, []);
  return hydrated;
}

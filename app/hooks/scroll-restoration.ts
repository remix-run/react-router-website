import * as React from "react";
import { useLocation } from "react-router-dom";
import { usePendingLocation } from "remix";

let firstRender = true;

function useScrollRestoration() {
  let positions = React.useRef<Map<string, number>>(new Map()).current;
  let location = useLocation();
  let pendingLocation = usePendingLocation();

  React.useEffect(() => {
    if (pendingLocation) {
      positions.set(location.key, window.scrollY);
    }
  }, [pendingLocation, location]);

  if (typeof window !== "undefined") {
    React.useLayoutEffect(() => {
      // don't restore scroll on initial render
      if (firstRender) {
        firstRender = false;
        return;
      }
      if (location.hash) {
        // This surprisingly isn't browser behavior :\
        document.querySelector(location.hash)?.scrollIntoView();
      } else {
        let y = positions.get(location.key);
        window.scrollTo(0, y || 0);
      }
    }, [location]);
  }
}

function useElementScrollRestoration(
  ref: React.MutableRefObject<HTMLElement | null>
) {
  let positions = React.useRef<Map<string, number>>(new Map()).current;
  let location = useLocation();
  let pendingLocation = usePendingLocation();

  React.useEffect(() => {
    if (!ref.current) return;
    if (pendingLocation) {
      positions.set(location.key, ref.current.scrollTop);
    }
  }, [pendingLocation, location]);

  if (typeof window !== "undefined") {
    // shutup React warnings, my gosh
    React.useLayoutEffect(() => {
      if (!ref.current) return;
      let y = positions.get(location.key);
      ref.current.scrollTo(0, y || 0);
    }, [location]);
  }
}

export { useElementScrollRestoration, useScrollRestoration };

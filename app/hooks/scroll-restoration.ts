import * as React from "react";
import { useLocation } from "react-router-dom";
import { useTransition } from "remix";

let firstRender = true;

if (typeof window !== "undefined") {
  window.history.scrollRestoration = "manual";
}

function useScrollRestoration() {
  let positions = React.useRef<Map<string, number>>(new Map()).current;
  let location = useLocation();
  let transition = useTransition();

  React.useEffect(() => {
    if (transition.location) {
      positions.set(location.key, window.scrollY);
    }
  }, [transition, location]);

  if (typeof window !== "undefined") {
    React.useLayoutEffect(() => {
      if (firstRender) {
        firstRender = false;
        return;
      }

      let y = positions.get(location.key);

      // been here before, scroll up (maybe want history action?)
      if (y) {
        window.scrollTo(0, y);
        return;
      }

      // try to scroll to the hash
      if (location.hash) {
        let el = document.querySelector(location.hash);
        if (el) {
          el.scrollIntoView();
          return;
        }
      }

      // otherwise go to the top!
      window.scrollTo(0, 0);
    }, [location]);
  }
}

function useElementScrollRestoration(
  ref: React.MutableRefObject<HTMLElement | null>
) {
  let positions = React.useRef<Map<string, number>>(new Map()).current;
  let location = useLocation();
  let pendingLocation = useTransition().location;

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

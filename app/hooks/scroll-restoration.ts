import * as React from "react";
import { useLocation } from "react-router-dom";
import { usePendingLocation } from "remix";

let firstRender = true;

function useScrollRestoration() {
  let positions = React.useRef<Map<string, number>>(new Map()).current;
  let location = useLocation();
  let pendingLocation = usePendingLocation();

  // normal cases
  React.useEffect(() => {
    // more weird stuff because of hash changes in history/react-router
    // we check the key so we don't save the location on in-document hash changes
    if (pendingLocation && pendingLocation.key !== location.key) {
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
      let y = positions.get(location.key);
      console.log("scroll", location);
      window.scrollTo(0, y || 0);
    }, [location]);
  }

  // in-document hash-links, see comments in delegate-links
  React.useEffect(() => {
    let handler = () => {
      console.log("handler", window.location.hash);
      if (window.location.hash) {
        console.log("hash!");
        document.querySelector(window.location.hash)?.scrollIntoView();
      }
    };
    window.addEventListener("hashchange", handler);
    return () => {
      window.removeEventListener("hashchange", handler);
    };
  });
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

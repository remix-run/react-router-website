/**
 * This delegates the markdown links to react router so we get clientside
 * transitions on them. It ignores any hash-change only (same document) links.
 *
 * Ideally we let those through and send them to navigate but there's some weird
 * behavior and changes we probably need to make to history/react-router-dom.
 *
 * - You don't get new locations even though navigate was called
 * - Unless the link being clicked is the same hash as the initial doc (?!)
 *   - Start at `/foo#start-hash`, click a hash link to `/foo#other-hash`
 *      - no new location in useLocation (?) even though navigate was called
 *   - Click a link to `/foo#start-hash
 *      - you get a new location!
 *   - Backing into the initial location from hash chnages will cause a
 *     location change
 *      - but the key is the same as it was before?
 *        - is the object changing but not its values?
 * - Adding a `historyRef.listen()` outside of the react code calls the
 *   listener on clicks/back/forward, but the key never changes
 *
 * So anyway, we prevent default on these in-page links and then move the scroll
 * around ourselves.
 */

import * as React from "react";
import { useNavigate, useLocation } from "react-router-dom";

function useDelegatedReactRouterLinks(nodeRef: React.RefObject<HTMLElement>) {
  let navigate = useNavigate();
  let location = useLocation();

  React.useEffect(() => {
    let handler = (event: MouseEvent) => {
      if (!nodeRef.current) return;
      if (!(event.target instanceof HTMLAnchorElement)) return;
      if (!event.target.hasAttribute("href")) return;
      let a = event.target as HTMLAnchorElement;

      if (
        a.host === window.location.host && // is internal
        // ignore hash clicks, see notes at the top of the file
        a.pathname !== location.pathname &&
        event.button === 0 && // left click
        (!a.target || a.target === "_self") && // Let browser handle "target=_blank" etc.
        !(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey) // not modified
      ) {
        let href = a.getAttribute("href");
        // see comment at the top about this:
        if (href?.startsWith("#")) {
          document.querySelector(window.location.hash)?.scrollIntoView();
          return;
        }
        event.preventDefault();
        let { pathname, search, hash } = a;
        navigate({ pathname, search, hash });
      }
    };

    if (!nodeRef.current) return;
    nodeRef.current.addEventListener("click", handler);

    return () => {
      if (!nodeRef.current) return;
      nodeRef.current.removeEventListener("click", handler);
    };
  }, []);
}

export { useDelegatedReactRouterLinks };

import * as React from "react";
import { useNavigate, useLocation } from "react-router-dom";

function useDelegatedReactRouterLinks(nodeRef: React.RefObject<HTMLElement>) {
  let navigate = useNavigate();

  React.useEffect(() => {
    let handler = (event: MouseEvent) => {
      if (!nodeRef.current) return;

      if (!(event.target instanceof HTMLElement)) return;

      let a = event.target.closest("a");

      if (
        a && // is anchor or has anchor parent
        a.hasAttribute("href") && // has an href
        a.host === window.location.host && // is internal
        event.button === 0 && // left click
        (!a.target || a.target === "_self") && // Let browser handle "target=_blank" etc.
        !(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey) // not modified
      ) {
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

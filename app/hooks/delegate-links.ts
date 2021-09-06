import * as React from "react";
import { useNavigate } from "react-router";

function useDelegatedReactRouterLinks() {
  let navigate = useNavigate();

  React.useEffect(() => {
    const wrapper = document.querySelector<HTMLElement>(
      "[data-docs-page-wrapper]"
    );

    if (wrapper == null) return;

    let handler = (event: MouseEvent) => {
      if (!(event.target instanceof HTMLAnchorElement)) return;
      if (!event.target.hasAttribute("href")) return;
      let a = event.target as HTMLAnchorElement;

      if (
        a.host === window.location.host && // is internal
        event.button === 0 && // left click
        (!a.target || a.target === "_self") && // Let browser handle "target=_blank" etc.
        !(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey) // not modified
      ) {
        event.preventDefault();
        navigate(a.pathname + a.search + a.hash);
      }
    };

    wrapper.addEventListener("click", handler);
    return () => wrapper.removeEventListener("click", handler);
  }, []);
}

export { useDelegatedReactRouterLinks };

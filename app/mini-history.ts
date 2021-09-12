import type { BrowserHistory, Listener, To } from "history";
import { Action } from "history";

let getLocationFromWindow = () => {
  const { search, hash, pathname } = window.location;

  return {
    pathname,
    search,
    hash,
    state: window.history.state,
    key: (window.history.state && window.history.state.key) || "initial",
  };
};

type NavigateFunction = (
  to: To | number,
  { state, replace }?: { state?: any; replace?: boolean }
) => void;

export let createHistory = () => {
  let listeners: Listener[] = [];
  let location = getLocationFromWindow();
  let action = Action.Pop;

  let navigate: NavigateFunction = (to, { state, replace = false } = {}) => {
    if (typeof to === "number") {
      window.history.go(to);
    } else {
      state = { ...state, key: Date.now() + "" };
      let href = createHref(to);

      // emulate browser's replace on current url behavior
      if (href === createHref(location)) {
        replace = true;
      }

      try {
        if (replace) {
          window.history.replaceState(state, "", href);
        } else {
          window.history.pushState(state, "", href);
        }
      } catch (e) {
        window.location[replace ? "replace" : "assign"](href);
      }
    }

    location = getLocationFromWindow();
    action = replace ? Action.Replace : Action.Push;
    listeners.forEach((listener) => listener({ location, action }));
  };

  let createHref = (to: To) => {
    if (typeof to === "string") return to;
    return (to.pathname || "/") + (to.search || "") + (to.hash || "");
  };

  let history: BrowserHistory = {
    get location() {
      return location;
    },

    get action() {
      return action;
    },

    listen(listener: Listener) {
      listeners.push(listener);

      let popstateListener = () => {
        location = getLocationFromWindow();
        action = Action.Pop;
        listener({ location, action });
      };

      window.addEventListener("popstate", popstateListener);

      return () => {
        window.removeEventListener("popstate", popstateListener);
        listeners = listeners.filter((fn) => fn !== listener);
      };
    },

    back() {
      navigate(-1);
    },

    forward() {
      navigate(1);
    },

    block: () => () => {},

    createHref,

    go(delta) {
      navigate(delta);
    },

    push(to, state) {
      navigate(to, { state });
    },

    replace(to, state) {
      navigate(to, { state, replace: true });
    },
  };

  return history;
};

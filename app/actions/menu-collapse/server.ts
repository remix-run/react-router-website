import {
  createCookie,
  unstable_createContext,
  type unstable_MiddlewareFunction,
  type unstable_RouterContextProvider,
} from "react-router";

let cookie = createCookie("menu-collapse", {
  // 7 days -- if the user hasn't visit in a while, go ahead and show them everything again
  maxAge: 7 * 24 * 60 * 60,
  sameSite: "lax",
});

// Default behavior: missing categories are treated as "open" (true)
type MenuCollapseState = Record<string, boolean>;

let menuCollapseStateContext = unstable_createContext<MenuCollapseState>({});

export function menuCollapseContext(context: unstable_RouterContextProvider) {
  return {
    get: () => {
      return context.get(menuCollapseStateContext);
    },
    set: (category: string, open: boolean) => {
      let menuCollapseState = context.get(menuCollapseStateContext);

      context.set(menuCollapseStateContext, {
        ...menuCollapseState,
        [category]: open,
      });
    },
    setAll: (state: MenuCollapseState) => {
      context.set(menuCollapseStateContext, state);
    },
  };
}

/**
 * Middleware to set the initial menu collapse state from the cookie
 * and update the cookie with the current state after processing the request
 *
 * This is used to persist the menu collapse state across page loads
 */
export let menuCollapseStateMiddleware: unstable_MiddlewareFunction<
  Response
> = async ({ request, context }, next) => {
  // Set the context to whatever is in the cookie
  let menuCollapseCookieState = await parseMenuCollapseState(request);
  let menuCollapse = menuCollapseContext(context);
  menuCollapse.setAll(menuCollapseCookieState);

  let res = await next();

  // If the state hasn't changed, don't set the cookie
  // the state could be changed by the menu collapse action
  let currentState = menuCollapse.get();
  if (statesEqual(menuCollapseCookieState, currentState)) {
    return res;
  }

  res.headers.append(
    "Set-Cookie",
    await cookie.serialize({
      menuCollapseState: currentState,
    }),
  );

  return res;
};

function statesEqual(
  state1: MenuCollapseState,
  state2: MenuCollapseState,
): boolean {
  const keys1 = Object.keys(state1);
  const keys2 = Object.keys(state2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    if (state1[key] !== state2[key]) {
      return false;
    }
  }

  return true;
}

async function parseMenuCollapseState(
  request: Request,
): Promise<MenuCollapseState> {
  let header = request.headers.get("Cookie");
  let vals = await cookie.parse(header);

  return vals?.menuCollapseState || {};
}

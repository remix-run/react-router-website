import {
  createCookie,
  createContext,
  type MiddlewareFunction,
  type RouterContextProvider,
} from "react-router";

let cookie = createCookie("menu-collapse", {
  // 7 days -- if the user hasn't visit in a while, go ahead and show them everything again
  maxAge: 7 * 24 * 60 * 60,
  sameSite: "lax",
});

// Default behavior: missing categories are treated as "open" (true)
type MenuCollapseState = Record<string, boolean>;

let menuCollapseStateContext = createContext<MenuCollapseState>({});

export function menuCollapseContext(context: Readonly<RouterContextProvider>) {
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
export let menuCollapseStateMiddleware: MiddlewareFunction<Response> = async (
  { request, context },
  next,
) => {
  // Set the context to whatever is in the cookie
  let menuCollapseCookieState = await parseMenuCollapseState(request);
  let menuCollapse = menuCollapseContext(context);
  menuCollapse.setAll(menuCollapseCookieState);

  let res = await next();

  res.headers.append(
    "Set-Cookie",
    await cookie.serialize({
      // Check the context again, because it could be mutated by the action
      menuCollapseState: menuCollapse.get(),
    }),
  );

  return res;
};

async function parseMenuCollapseState(
  request: Request,
): Promise<MenuCollapseState> {
  let header = request.headers.get("Cookie");
  let vals = await cookie.parse(header);

  return vals?.menuCollapseState || {};
}

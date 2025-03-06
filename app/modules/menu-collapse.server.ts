import {
  createCookieSessionStorage,
  unstable_createContext,
  type Session,
  type unstable_MiddlewareFunction,
  type unstable_RouterContextProvider,
} from "react-router";

type MenuCollapseState = {
  "menu-collapse-state"?: Record<string, boolean>;
};

let storage = createCookieSessionStorage<MenuCollapseState>({
  cookie: {
    secrets: ["doesn't matter it's just menu collapse state"],
    name: "_menu-collapse-state",
    maxAge: 60 * 60 * 24 * 365,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  },
});

let menuCollapseStateContext =
  unstable_createContext<Session<MenuCollapseState>>();

export let menuCollapseStateMiddleware: unstable_MiddlewareFunction<
  Response
> = async ({ request, context }, next) => {
  let cookieHeader = request.headers.get("Cookie");
  let session = await storage.getSession(cookieHeader);
  context.set(menuCollapseStateContext, session);

  let res = await next();
  res.headers.append("Set-Cookie", await storage.commitSession(session));
  return res;
};

export function menuCollapseContext(context: unstable_RouterContextProvider) {
  let session = context.get(menuCollapseStateContext);

  return {
    get: () => {
      let state = session.get("menu-collapse-state") || {};
      return state;
    },
    set: (category: string, value: boolean) => {
      let state = session.get("menu-collapse-state") || {};
      state[category] = value;
      session.set("menu-collapse-state", state);
    },
  };
}

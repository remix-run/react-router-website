import {
  createCookieSessionStorage,
  type MiddlewareFunctionArgs,
  type RouterContext,
  type Session,
} from "react-router";
import { createContext, provide, pull } from "@ryanflorence/async-provider";

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

let menuCollapseStateContext = createContext<Session<MenuCollapseState>>();

export let menuCollapseStateMiddleware = async ({
  request,
  next,
}: MiddlewareFunctionArgs<RouterContext, Response>) => {
  let cookieHeader = request.headers.get("Cookie");
  let session = await storage.getSession(cookieHeader);
  // Setting the cookie and wrapping the response in the context
  return provide([[menuCollapseStateContext, session]], async () => {
    try {
      let res = await next();
      res.headers.append("Set-Cookie", await storage.commitSession(session));
      return res;
    } catch (e) {
      console.log("session middleware error", request.url);
      console.log(e);
      return new Response("Oops, something went wrong.", { status: 500 });
    }
  });
};

export function setMenuCollapseState(category: string, value: boolean) {
  let session = pull(menuCollapseStateContext);
  let state = session.get("menu-collapse-state") || {};
  state[category] = value;
  session.set("menu-collapse-state", state);
}

export function getMenuCollapseState() {
  let session = pull(menuCollapseStateContext);
  let state = session.get("menu-collapse-state") || {};
  return state;
}

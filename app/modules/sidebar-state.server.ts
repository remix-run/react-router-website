import {
  createCookieSessionStorage,
  type MiddlewareFunctionArgs,
  type Session,
} from "react-router";
import { createContext, provide, pull } from "@ryanflorence/async-provider";

let storage = createCookieSessionStorage({
  cookie: {
    name: "_sidebar-state",
    maxAge: 60 * 60 * 24 * 365,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  },
});

let context = createContext<Session>();

export const sidebarSessionMiddleware = async ({
  request,
  next,
}: MiddlewareFunctionArgs) => {
  let cookieHeader = request.headers.get("Cookie");
  let session = await storage.getSession(cookieHeader);
  // Setting the cookie and wrapping the response in the context
  return provide([[context, session]], async () => {
    try {
      let res = (await next()) as Response;
      res.headers.append("Set-Cookie", await storage.commitSession(session));
      return res;
    } catch (e) {
      console.log("session middleware error", request.url);
      console.log(e);
      return new Response("Oops, something went wrong.", { status: 500 });
    }
  });
};

export function sidebarSession() {
  return pull(context);
}

export function setSidebarState(key: string, value: boolean) {
  let session = sidebarSession();
  let state = session.get("sidebar-state") || {};
  state[key] = value;
  session.set("sidebar-state", state);
}

export function getSidebarState(): Record<string, boolean> {
  let session = sidebarSession();
  let state = session.get("sidebar-state") || {};
  return state;
}

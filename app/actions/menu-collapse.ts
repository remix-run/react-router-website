import {
  createCookie,
  unstable_createContext,
  type unstable_MiddlewareFunction,
} from "react-router";
import type { Route } from "./+types/menu-collapse";

let cookie = createCookie("menu-collapse", {
  // 7 days -- if the user hasn't visit in a while, go ahead and show them everything again
  maxAge: 7 * 24 * 60 * 60,
  sameSite: "lax",
});

type MenuCollapseState = Record<string, boolean>;

export let menuCollapseStateContext = unstable_createContext<MenuCollapseState>(
  {},
);

export let menuCollapseStateMiddleware: unstable_MiddlewareFunction<
  Response
> = async ({ request, context }, next) => {
  // Set the context to whatever is in the cookie
  let menuCollapseState = await parseMenuCollapseState(request);
  context.set(menuCollapseStateContext, menuCollapseState);

  let res = await next();
  // Check the context again, because it could be mutated by the action
  menuCollapseState = context.get(menuCollapseStateContext);
  res.headers.append(
    "Set-Cookie",
    await cookie.serialize({ menuCollapseState }),
  );
  return res;
};

// TODO: Do we want to do more validation?
async function parseMenuCollapseState(
  request: Request,
): Promise<MenuCollapseState> {
  let header = request.headers.get("Cookie");
  let vals = await cookie.parse(header);

  return vals?.menuCollapseState || {};
}

export async function action({ request, context }: Route.ActionArgs) {
  let formData = await request.formData();
  let category = formData.get("category");
  if (!category || typeof category !== "string") {
    return new Response("Name is required", { status: 400 });
  }

  let open = formData.get("open");
  if (open !== "true" && open !== "false") {
    return new Response("Open must be true or false", { status: 400 });
  }

  let parsedOpen = open === "true";

  let menuCollapseState = context.get(menuCollapseStateContext);

  context.set(menuCollapseStateContext, {
    ...menuCollapseState,
    [category]: parsedOpen,
  });

  return parsedOpen;
}

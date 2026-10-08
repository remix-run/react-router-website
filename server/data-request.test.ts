import { RequestContext } from "@remix-run/fetch-router";
import { vi } from "vitest";

import { ignoreAcceptOnDataRequests } from "./data-request.ts";

function createContext(pathname: string, method = "GET") {
  return new RequestContext(
    new Request(`http://localhost${pathname}`, {
      method,
      headers: { Accept: "text/markdown", "X-Test": "kept" },
    }),
  );
}

function createNext(vary: string) {
  return vi.fn(() =>
    Promise.resolve(new Response("OK", { headers: { Vary: vary } })),
  );
}

async function invoke(context: RequestContext, next: () => Promise<Response>) {
  let response = await ignoreAcceptOnDataRequests()(context, next);
  if (!(response instanceof Response)) {
    throw new Error("Expected middleware to return a response");
  }

  return response;
}

describe("ignoreAcceptOnDataRequests", () => {
  it.each(["/start/framework/routing.data", "/start/framework/routing.rsc"])(
    "ignores Accept for %s",
    async (pathname) => {
      let context = createContext(pathname);

      let response = await invoke(context, createNext("Cookie, Accept"));

      expect(context.headers.has("Accept")).toBe(false);
      expect(context.headers.get("X-Test")).toBe("kept");
      expect(response.headers.get("Vary")).toBe("Cookie");
    },
  );

  it("removes Vary entirely when Accept was the only value", async () => {
    let response = await invoke(
      createContext("/home.data"),
      createNext("Accept"),
    );

    expect(response.headers.has("Vary")).toBe(false);
  });

  it.each([
    ["document requests", "GET", "/start/framework/routing"],
    ["Markdown requests", "GET", "/start/framework/routing.md"],
    ["data mutations", "POST", "/start/framework/routing.data"],
  ])("leaves %s alone", async (_label, method, pathname) => {
    let context = createContext(pathname, method);

    let response = await invoke(context, createNext("Cookie, Accept"));

    expect(context.headers.get("Accept")).toBe("text/markdown");
    expect(response.headers.get("Vary")).toBe("Cookie, Accept");
  });
});

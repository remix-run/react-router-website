import { vi } from "vitest";

import { ignoreAcceptOnDataRequests } from "./data-request.ts";

function createHandler(vary: string | null) {
  return vi.fn((_request: Request) => {
    let headers = new Headers();
    if (vary) headers.set("Vary", vary);
    return Promise.resolve(new Response("OK", { headers }));
  });
}

describe("ignoreAcceptOnDataRequests", () => {
  it.each(["/start/framework/routing.data", "/start/framework/routing.rsc"])(
    "ignores Accept for %s",
    async (pathname) => {
      let handler = createHandler("Cookie, Accept");
      let request = new Request(`http://localhost${pathname}`, {
        headers: { Accept: "text/markdown", "X-Test": "kept" },
      });

      let response = await ignoreAcceptOnDataRequests(handler)(request);

      let forwarded = handler.mock.calls[0][0];
      expect(forwarded.headers.has("Accept")).toBe(false);
      expect(forwarded.headers.get("X-Test")).toBe("kept");
      expect(response.headers.get("Vary")).toBe("Cookie");
    },
  );

  it("removes Vary entirely when Accept was the only value", async () => {
    let handler = createHandler("Accept");
    let request = new Request("http://localhost/home.data");

    let response = await ignoreAcceptOnDataRequests(handler)(request);

    expect(response.headers.has("Vary")).toBe(false);
  });

  it.each([
    ["document requests", "GET", "/start/framework/routing"],
    ["Markdown requests", "GET", "/start/framework/routing.md"],
    ["data mutations", "POST", "/start/framework/routing.data"],
  ])("leaves %s alone", async (_label, method, pathname) => {
    let handler = createHandler("Cookie, Accept");
    let request = new Request(`http://localhost${pathname}`, {
      method,
      headers: { Accept: "text/markdown" },
    });

    let response = await ignoreAcceptOnDataRequests(handler)(request);

    expect(handler.mock.calls[0][0]).toBe(request);
    expect(response.headers.get("Vary")).toBe("Cookie, Accept");
  });
});

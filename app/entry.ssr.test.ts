import { beforeEach, describe, expect, it, vi } from "vitest";

const { routeRSCServerRequest } = vi.hoisted(() => ({
  routeRSCServerRequest: vi.fn(),
}));

vi.mock("@vitejs/plugin-rsc/ssr", () => ({
  createFromReadableStream: vi.fn(),
}));
vi.mock("react-router", () => ({
  unstable_routeRSCServerRequest: routeRSCServerRequest,
  unstable_RSCStaticRouter: vi.fn(),
}));

import { generateHTML } from "./entry.ssr";

describe("RSC SSR response handling", () => {
  beforeEach(() => {
    routeRSCServerRequest.mockReset();
  });

  it("passes Markdown middleware responses through without decoding them", async () => {
    const request = new Request("https://reactrouter.com/home.md");
    const response = new Response("# React Router Home", {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Cache-Control": "public, max-age=300",
        "X-Markdown-Tokens": "5",
      },
    });

    const result = await generateHTML(request, response);
    expect(await result.text()).toBe("# React Router Home");
    expect(result.headers.get("Content-Type")).toBe(
      "text/markdown; charset=utf-8",
    );
    expect(result.headers.get("Cache-Control")).toBe("public, max-age=300");
    expect(result.headers.get("X-Markdown-Tokens")).toBe("5");
    expect(routeRSCServerRequest).not.toHaveBeenCalled();
  });

  it("delegates Flight streams to the RSC request handler", async () => {
    const request = new Request("https://reactrouter.com/home");
    const response = new Response("Flight payload", {
      headers: { "Content-Type": "text/x-component" },
    });
    const htmlResponse = new Response("<!doctype html>");
    routeRSCServerRequest.mockResolvedValue(htmlResponse);

    expect(await generateHTML(request, response)).toBe(htmlResponse);
    expect(routeRSCServerRequest).toHaveBeenCalledWith(
      expect.objectContaining({ request, serverResponse: response }),
    );
  });
});

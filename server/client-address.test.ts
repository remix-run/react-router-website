import {
  CLIENT_ADDRESS_HEADER,
  getClientAddressFromHeaders,
  normalizeClientAddress,
  withClientAddress,
} from "./client-address.ts";

describe("client address helpers", () => {
  it("falls back to the injected client address header", () => {
    let headers = new Headers({
      [CLIENT_ADDRESS_HEADER]: "::ffff:198.51.100.7",
    });

    expect(getClientAddressFromHeaders(headers)).toBe("198.51.100.7");
  });

  it("prefers forwarded headers over the injected fallback", () => {
    let headers = new Headers({
      [CLIENT_ADDRESS_HEADER]: "198.51.100.7",
      "x-forwarded-for": "203.0.113.9, 198.51.100.7",
    });

    expect(getClientAddressFromHeaders(headers)).toBe("203.0.113.9");
  });

  it("normalizes quoted, bracketed, and port-suffixed addresses", () => {
    expect(normalizeClientAddress('"203.0.113.10:443"')).toBe("203.0.113.10");
    expect(normalizeClientAddress("[2001:db8::1]")).toBe("2001:db8::1");
    expect(normalizeClientAddress("::ffff:192.0.2.25")).toBe("192.0.2.25");
  });

  it("attaches a normalized client address without changing the request", async () => {
    let request = new Request("http://localhost/docs", {
      method: "POST",
      body: "hello",
      headers: {
        "content-type": "text/plain",
      },
    });

    let nextRequest = withClientAddress(request, "::ffff:203.0.113.42");

    expect(nextRequest.url).toBe(request.url);
    expect(nextRequest.method).toBe("POST");
    expect(nextRequest.headers.get(CLIENT_ADDRESS_HEADER)).toBe("203.0.113.42");
    await expect(nextRequest.text()).resolves.toBe("hello");
  });
});

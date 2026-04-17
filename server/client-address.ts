export const CLIENT_ADDRESS_HEADER = "x-client-address";

const CLIENT_ADDRESS_HEADERS = [
  "cf-connecting-ip",
  "true-client-ip",
  "x-real-ip",
  "x-forwarded-for",
  CLIENT_ADDRESS_HEADER,
] as const;

export function withClientAddress(
  request: Request,
  clientAddress: string,
): Request {
  let normalizedAddress = normalizeClientAddress(clientAddress);
  if (!normalizedAddress) {
    return request;
  }

  let headers = new Headers(request.headers);
  headers.set(CLIENT_ADDRESS_HEADER, normalizedAddress);

  return new Request(request, { headers });
}

export function getClientAddressFromHeaders(headers: Headers): string | null {
  for (let headerName of CLIENT_ADDRESS_HEADERS) {
    let rawValue = headers.get(headerName);
    if (!rawValue) continue;

    let firstValue = getFirstHeaderValue(rawValue);
    if (!firstValue) continue;

    let normalizedValue = normalizeClientAddress(firstValue);
    if (normalizedValue) {
      return normalizedValue;
    }
  }

  return null;
}

export function normalizeClientAddress(clientAddress: string): string {
  let unquotedAddress = clientAddress.replace(/^"(.*)"$/, "$1").trim();
  if (!unquotedAddress) {
    return "";
  }

  if (unquotedAddress.startsWith("[") && unquotedAddress.includes("]")) {
    return unquotedAddress.slice(1, unquotedAddress.indexOf("]"));
  }

  if (unquotedAddress.startsWith("::ffff:")) {
    return unquotedAddress.slice("::ffff:".length);
  }

  if (unquotedAddress.includes(".") && unquotedAddress.includes(":")) {
    return unquotedAddress.split(":")[0] ?? "";
  }

  return unquotedAddress;
}

function getFirstHeaderValue(value: string): string {
  return value.split(",")[0]?.trim() ?? "";
}

export function isHost(expectedHost: string, request: Request) {
  let host =
    request.headers.get("X-Forwarded-Host") ??
    request.headers.get("Host") ??
    "unknown";

  return expectedHost === host;
}

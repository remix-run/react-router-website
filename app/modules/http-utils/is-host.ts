export function isHost(request: Request, expectedHost: string) {
  return expectedHost === request.headers.get("Host");
}

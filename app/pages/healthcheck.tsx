// learn more: https://fly.io/docs/reference/configuration/#services-http_checks

export async function loader() {
  return new Response("OK");
}

// learn more: https://fly.io/docs/reference/configuration/#services-http_checks
import type { LoaderFunction } from "react-router";

export const loader: LoaderFunction = async () => {
  return new Response("OK");
};

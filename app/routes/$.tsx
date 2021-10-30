import { handleRedirects } from "~/utils/http";
import type { LoaderFunction } from "remix";

export let loader: LoaderFunction = async ({ request }) => {
  await handleRedirects(request);
  throw new Response("", {
    status: 404,
    statusText: "Not Found",
  });
};

export default function () {
  return null;
}

import type { LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { getLatestRepoTag } from "~/gh-docs";

export let loader: LoaderFunction = async ({ params, request }) => {
  let tag = await getLatestRepoTag();

  if (!tag) {
    throw new Response("Failed to fetch tags from GitHub", { status: 503 });
  }

  return redirect(`/en/${tag}`);
};

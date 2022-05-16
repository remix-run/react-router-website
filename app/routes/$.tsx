import type { LoaderFunction } from "@remix-run/node";
import { whyDoWeNotHaveGoodMiddleWareYetRyan } from "~/http";

export let loader: LoaderFunction = async ({ request }) => {
  await whyDoWeNotHaveGoodMiddleWareYetRyan(request);
  throw new Response("Not Found", { status: 404 });
};

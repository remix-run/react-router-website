import type { LoaderFunction } from "@remix-run/node";
import { Link, useCatch } from "@remix-run/react";
import { whyDoWeNotHaveGoodMiddleWareYetRyan } from "~/http";

export let loader: LoaderFunction = async ({ request }) => {
  await whyDoWeNotHaveGoodMiddleWareYetRyan(request);
  throw new Response("Not Found", { status: 404 });
};

export default function Catchall() {
  return null;
}

export function CatchBoundary() {
  let caught = useCatch();

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      <div className="font-bold">{caught.status}</div>
      <div>{caught.statusText || "Not Found"}</div>
      <Link to="/" className="mt-8 underline">
        Go Home
      </Link>
    </div>
  );
}

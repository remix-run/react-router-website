import type { LoaderFunctionArgs } from "@remix-run/node";
import { Link, isRouteErrorResponse, useRouteError } from "@remix-run/react";
import { whyDoWeNotHaveGoodMiddleWareYetRyan } from "~/http";

export let loader = async ({ request }: LoaderFunctionArgs) => {
  await whyDoWeNotHaveGoodMiddleWareYetRyan(request);
  throw new Response("Not Found", { status: 404 });
};

export default function Catchall() {
  return null;
}

export function ErrorBoundary() {
  let error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-bold">{error.status}</div>
        <div>{error.statusText || "Not Found"}</div>
        <Link to="/" className="mt-8 underline">
          Go Home
        </Link>
      </div>
    );
  }

  throw error;
}

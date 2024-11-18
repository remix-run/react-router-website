import { Link, isRouteErrorResponse, useRouteError } from "react-router";
import { CACHE_CONTROL } from "~/http";
import type { Route } from "./+types/notfound";

export let loader = async () => {
  // TODO: use `data` or whatever we end up with in single fetch instead of
  // throwing here
  throw new Response("Not Found", { status: 404 });
};

export const meta: Route.MetaFunction = () => {
  let robots = "noindex, nofollow";
  return [
    { title: "Not Found | React Router" },
    { name: "robots", content: robots },
    { name: "googlebot", content: robots },
  ];
};

export function headers() {
  return { "Cache-Control": CACHE_CONTROL.none };
}

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

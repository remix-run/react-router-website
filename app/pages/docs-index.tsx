import { type LoaderFunctionArgs, redirect } from "@remix-run/node";

export function loader({ request }: LoaderFunctionArgs) {
  let url = new URL(request.url);
  return redirect(url.pathname + "/home");
}

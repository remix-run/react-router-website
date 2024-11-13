import { type LoaderFunctionArgs, redirect } from "react-router";

export function loader({ request }: LoaderFunctionArgs) {
  let url = new URL(request.url);
  return redirect(url.pathname + "/home");
}

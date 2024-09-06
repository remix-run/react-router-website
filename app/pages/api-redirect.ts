import { type LoaderFunctionArgs, redirect } from "@remix-run/node";

export function loader({ params }: LoaderFunctionArgs) {
  return redirect(
    params.ref ? `/${params.ref}/api/react-router` : "/api/react-router"
  );
}

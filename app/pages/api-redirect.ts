import { type LoaderFunctionArgs, redirect } from "@remix-run/node";

export function loader({ params }: LoaderFunctionArgs) {
  return redirect(
    // TODO: use this with v7 launch
    // params.ref ? `/${params.ref}/api/react-router` : "/api/react-router"
    "/dev/api/react-router"
  );
}

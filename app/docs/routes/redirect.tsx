import type { LoaderFunction, RouteComponent } from "remix";
import { redirect } from "remix";
import { getVersions } from "../../utils.server";

let loader: LoaderFunction = async ({ context }) => {
  let versions = await getVersions(context.docs);
  return redirect(`/${versions[0].head}`);
};

const RedirectPage: RouteComponent = () => {
  return null;
};

export default RedirectPage;
export { loader };

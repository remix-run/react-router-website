import type { LoaderFunction, RouteComponent } from "remix";
import { redirect } from "remix";
import { getVersions } from "../../utils.server";

let loader: LoaderFunction = async ({ params }) => {
  let lang = params.lang ?? "en";
  let [latest] = await getVersions();
  return redirect(`/docs/${lang}/${latest.head}`);
};

const RedirectPage: RouteComponent = () => {
  return null;
};

export default RedirectPage;
export { loader };

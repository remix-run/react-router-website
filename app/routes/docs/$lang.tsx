import type { LoaderFunction, RouteComponent } from "remix";
import invariant from "tiny-invariant";
import { ensureLang } from "~/lib/ensure-lang-version";

let loader: LoaderFunction = async ({ request, params }) => {
  invariant(!!params.lang, "Expected language param");
  return ensureLang(params.lang);
};

const RedirectPage: RouteComponent = () => {
  return null;
};

export default RedirectPage;
export { loader };

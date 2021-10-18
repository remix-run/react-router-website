import invariant from "tiny-invariant";
import { LoaderFunction, RouteComponent } from "remix";

import { json } from "remix";

import { getDoc } from "~/utils.server";
import { DocsPage } from "~/components/doc";

let loader: LoaderFunction = async ({ params }) => {
  invariant(!!params.version, "Expected version param");
  invariant(!!params.lang, "Expected language param");
  invariant(!!params["*"], "Expected file path");

  let { lang, version } = params;

  let doc = await getDoc(params["*"], version, lang);

  return json(doc);
};

const SplatPage: RouteComponent = () => {
  return <DocsPage />;
};

export default SplatPage;
export { loader };
export { meta } from "~/components/doc";

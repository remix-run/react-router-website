import {
  HeadersFunction,
  LoaderFunction,
  redirect,
  RouteComponent,
} from "remix";
import { json } from "remix";
import invariant from "tiny-invariant";
import locale from "locale-codes";

import { getDoc, getVersions } from "~/utils.server";
import { DocsPage } from "~/components/doc";

// this and splat.tsx loader are identical except the "index" vs. params["*"]
// part
let loader: LoaderFunction = async ({ params }) => {
  invariant(!!params.version, "Expected version param");
  invariant(!!params.lang, "Expected language param");

  let validLang = locale.getByTag(params.lang);

  if (!validLang) {
    let [latest] = await getVersions();
    return redirect(`/docs/en/${latest.head}/${params.lang}/${params.version}`);
  }

  let doc = await getDoc("index", params.version, params.lang);
  return json(doc);
};

const headers: HeadersFunction = ({ loaderHeaders }) => {
  return {
    // so fresh!
    "Cache-Control": "max-age=0",
    "Server-Timing": loaderHeaders.get("Server-Timing") ?? "",
  };
};

const VersionIndexPage: RouteComponent = () => {
  return <DocsPage />;
};

export default VersionIndexPage;
export { headers, loader };
export { meta } from "~/components/doc";

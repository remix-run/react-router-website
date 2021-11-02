import type { HeadersFunction, LoaderFunction, RouteComponent } from "remix";
import { json } from "remix";
import { getDoc } from "~/utils.server";
import { DocsPage } from "~/components/doc";
import invariant from "tiny-invariant";
import { CACHE_CONTROL } from "~/utils/http";

// this and splat.tsx loader are identical except the "index" vs. params["*"]
// part
let loader: LoaderFunction = async ({ params }) => {
  invariant(!!params.version, "Expected version param");
  invariant(!!params.lang, "Expected language param");

  let doc = await getDoc("index", params.version, params.lang);
  return json(doc, { headers: { "Cache-Control": CACHE_CONTROL } });
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

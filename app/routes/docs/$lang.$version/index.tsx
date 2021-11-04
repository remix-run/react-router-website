import { LoaderFunction, RouteComponent } from "remix";
import { json } from "remix";
import invariant from "tiny-invariant";

import { getDoc } from "~/utils.server";
import { DocsPage } from "~/components/doc";
import { ensureLangAndVersion } from "~/lib/ensure-lang-version";
import { CACHE_CONTROL } from "~/utils/http";

// this and splat.tsx loader are identical except the "index" vs. params["*"]
// part
let loader: LoaderFunction = async ({ params }) => {
  invariant(!!params.version, "Expected version param");
  invariant(!!params.lang, "Expected language param");

  await ensureLangAndVersion(params);

  let doc = await getDoc("index", params.version, params.lang);
  return json(doc, { headers: { "Cache-Control": CACHE_CONTROL } });
};

const VersionIndexPage: RouteComponent = () => {
  return <DocsPage />;
};

export default VersionIndexPage;
export { loader };
export { meta } from "~/components/doc";

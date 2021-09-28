import type { HeadersFunction, LoaderFunction, RouteComponent } from "remix";
import { json } from "remix";
import { getDoc, getVersion, getVersions } from "~/utils.server";
import { DocsPage } from "~/components/doc";
import { time } from "~/utils/time";

// this and splat.tsx loader are identical except the "index" vs. params["*"]
// part
let loader: LoaderFunction = async ({ context, params }) => {
  let versions = await getVersions();
  let version = getVersion(params.version, versions) || {
    version: params.version,
    head: params.version,
    isLatest: false,
  };

  try {
    let [ms, doc] = await time(() =>
      getDoc(context.docs, "/", version, params.lang)
    );

    // we could also throw an error in getDoc if the doc doesn't exist
    if (!doc) {
      return json({ notFound: true }, { status: 404 });
    }

    return json(doc, { headers: { "Server-Timing": `db;dur=${ms}` } });
  } catch (error: unknown) {
    console.error(error);
    return json({ notFound: true }, { status: 404 });
  }
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

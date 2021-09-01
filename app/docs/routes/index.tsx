import type { LoaderFunction, RouteComponent } from "remix";
import { json } from "remix";
import { getDoc, getVersion, getVersions } from "~/utils.server";
import { Page } from "~/components/page";

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
    let doc = await getDoc(context.docs, "index", version, params.lang);

    // we could also throw an error in getDoc if the doc doesn't exist
    if (!doc) {
      return json({ notFound: true }, { status: 404 });
    }

    // so fresh!
    return json(doc, { headers: { "Cache-Control": "max-age=0" } });
  } catch (error: unknown) {
    console.error(error);
    return json({ notFound: true }, { status: 404 });
  }
};

const IndexPage: RouteComponent = () => {
  return <Page />;
};

export default IndexPage;
export { loader };
export { meta } from "~/components/page";

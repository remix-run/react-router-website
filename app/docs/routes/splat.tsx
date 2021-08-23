import { LoaderFunction, RouteComponent, useRouteData } from "remix";
import { json } from "remix";

import { Doc, getDoc, getVersion, getVersions } from "../../utils.server";

let loader: LoaderFunction = async ({ params, context }) => {
  let versions = await getVersions();

  let version = getVersion(params.version, versions) || {
    version: params.version,
    head: params.version,
    isLatest: false,
  };

  let slugParam = params["*"];
  // get rid of leading (and trailing) `/`
  let slug = slugParam.replace(/^\//, "").replace(/\/$/, "");

  try {
    let doc = await getDoc(context.docs, slug, version);
    // so fresh!
    return json(doc, { headers: { "Cache-Control": "max-age=0" } });
  } catch (error) {
    console.error(error);
    return json({ notFound: true }, { status: 404 });
  }
};

const SplatPage: RouteComponent = () => {
  const doc = useRouteData<Doc>();

  if (!doc) {
    return (
      <div>
        <h1>Not Found</h1>
        <p>Sorry, there is no document here.</p>
      </div>
    );
  }

  return (
    <div>
      <h1>{doc.title}</h1>
      <h2>Version: {doc.attributes.version}</h2>
      <div
        className="content-container"
        dangerouslySetInnerHTML={{ __html: doc.html }}
      />
    </div>
  );
};

export default SplatPage;
export { loader };

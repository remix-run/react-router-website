import { LoaderFunction, useRouteData } from "remix";
import { json } from "remix";

import {
  Doc,
  getCacheControl,
  getDoc,
  getVersion,
  getVersions,
} from "../../utils.server";

export let loader: LoaderFunction = async ({ params, context, request }) => {
  let versions = await getVersions(context.docs);
  let version = getVersion(params.version, versions) || {
    version: params.version.replace(/^v/, ""),
    head: params.version.replace(/^v/, ""),
    isLatest: false,
  };

  let slugParam = params["*"];
  // get rid of leading (and trailing) `/`
  let slug = slugParam.replace(/^\//, "").replace(/\/$/, "");

  try {
    let doc = await getDoc(context.docs, slug, version);
    return json(doc, {
      headers: { "Cache-Control": getCacheControl(request.url) },
    });
  } catch (error) {
    console.error(error);
    return json({ notFound: true }, { status: 404 });
  }
};

export default function Splat() {
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
      <div
        className="content-container"
        dangerouslySetInnerHTML={{ __html: doc.html }}
      />
    </div>
  );
}

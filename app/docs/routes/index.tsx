import { MetaFunction, LoaderFunction, json } from "remix";
import { useRouteData } from "remix";

import { getDoc, getVersion, getVersions } from "../../utils.server";

export let meta: MetaFunction = () => {
  return {
    title: "Remix Starter",
    description: "Welcome to remix!",
  };
};

export let loader: LoaderFunction = async ({ context, params }) => {
  let versions = await getVersions(context.docs);
  let version = getVersion(params.version, versions) || {
    version: params.version.replace(/^v/, ""),
    head: params.version.replace(/^v/, ""),
    isLatest: false,
  };

  try {
    let doc = await getDoc(context.docs, "index", version);
    return json(doc, {});
  } catch (error: unknown) {
    console.error(error);
    return json({ notFound: true }, { status: 404 });
  }
};

export default function IndexPage() {
  let data = useRouteData();

  return (
    <div style={{ textAlign: "center", padding: 20 }}>
      <h2>{data.title}</h2>
      <article dangerouslySetInnerHTML={{ __html: data.html }} />
    </div>
  );
}

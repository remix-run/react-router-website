import * as React from "react";
import {
  HeadersFunction,
  LoaderFunction,
  redirect,
  RouteComponent,
} from "remix";

import { json } from "remix";

import { getDoc, getVersion, getVersions } from "~/utils.server";
import { Page } from "~/components/doc";
import { time } from "~/utils/time";

let loader: LoaderFunction = async ({ params, context }) => {
  let path = await import("path");
  try {
    let versions = await getVersions();

    let version = getVersion(params.version, versions) || {
      version: params.version,
      head: params.version,
      isLatest: false,
    };

    let lang = params.lang;
    let slugParam = params["*"];
    // get rid of the trailing `/`
    let slug = slugParam.replace(/\/$/, "");
    let ext = path.extname(slug);

    if (ext) {
      let { dir, name } = path.parse(slug);

      let noExtension = dir.endsWith("/") ? dir : dir + "/" + name;

      return redirect(`/docs/${lang}/${version.head}${noExtension}/`);
    }

    let [ms, doc] = await time(() => getDoc(context.docs, slug, version, lang));

    // we could also throw an error in getDoc if the doc doesn't exist
    if (!doc) {
      return json({ notFound: true }, { status: 404 });
    }

    return json(doc, { headers: { "Server-Timing": `db;dur=${ms}` } });
  } catch (error) {
    console.error(error);
    return json({ notFound: true }, { status: 404 });
  }
};

const headers: HeadersFunction = ({ loaderHeaders }) => {
  return {
    "Server-Timing": loaderHeaders.get("Server-Timing") ?? "",
  };
};

const SplatPage: RouteComponent = () => {
  return <Page />;
};

export default SplatPage;
export { headers, loader };
export { meta } from "~/components/doc";

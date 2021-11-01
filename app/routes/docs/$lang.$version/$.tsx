import path from "path";
import invariant from "tiny-invariant";
import { LoaderFunction, redirect, RouteComponent } from "remix";
import locale from "locale-codes";

import { json } from "remix";

import { getDoc, getVersions } from "~/utils.server";
import { DocsPage } from "~/components/doc";

let loader: LoaderFunction = async ({ params }) => {
  invariant(!!params.version, "Expected version param");
  invariant(!!params.lang, "Expected language param");
  invariant(!!params["*"], "Expected file path");

  let { lang, version } = params;
  let validLang = locale.getByTag(lang);

  if (!validLang) {
    let [latest] = await getVersions();

    let actualPath = path.resolve(
      `/docs/en`,
      latest.head,
      lang, // not actually a lang, but a directory
      version, // not actually a version, but a directory
      params["*"]
    );

    return redirect(actualPath);
  }

  let doc = await getDoc(params["*"], version, lang);

  return json(doc);
};

const SplatPage: RouteComponent = () => {
  return <DocsPage />;
};

export default SplatPage;
export { loader };
export { meta } from "~/components/doc";

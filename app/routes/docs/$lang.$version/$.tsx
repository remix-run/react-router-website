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
    return redirect(
      `/docs/en/${latest.head}/${params.lang}/${params.version}/${params["*"]}`
    );
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

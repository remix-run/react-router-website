import path from "path";
import { LoaderFunction, redirect, RouteComponent } from "remix";
import { json } from "remix";
import invariant from "tiny-invariant";
import locale from "locale-codes";

import { getDoc, getVersions } from "~/utils.server";
import { DocsPage } from "~/components/doc";

// this and splat.tsx loader are identical except the "index" vs. params["*"]
// part
let loader: LoaderFunction = async ({ params }) => {
  invariant(!!params.version, "Expected version param");
  invariant(!!params.lang, "Expected language param");

  let { lang, version } = params;
  let validLang = locale.getByTag(lang);

  if (!validLang) {
    console.log(`Invalid language: ${lang}`);
    let [latest] = await getVersions();

    let actualPath = path.resolve(
      `/docs/en`,
      latest.head,
      lang, // not actually a lang, but a directory
      version // not actually a version, but a file
    );

    return redirect(actualPath);
  }

  let doc = await getDoc("index", version, lang);
  return json(doc);
};

const VersionIndexPage: RouteComponent = () => {
  return <DocsPage />;
};

export default VersionIndexPage;
export { loader };
export { meta } from "~/components/doc";

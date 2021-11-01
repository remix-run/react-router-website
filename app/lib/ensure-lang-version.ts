import path from "path";

import { Params } from "react-router-dom";
import locale from "locale-codes";
import invariant from "tiny-invariant";
import { redirect } from "remix";
import { getVersions } from "~/utils.server";

/**
 * ensures that the language and version is set in the URL, if not, redirect to latest english version and forward the path
 * @param {Params} params the params from the URL
 * param.lang the language code
 * param.version the version code
 * param["*"] the path to the page
 */
async function ensureLangAndVersion(params: Params<"lang" | "version" | "*">) {
  invariant(!!params.version, "Need a version param");
  invariant(!!params.lang, "Need a lang param");

  let validLang = locale.getByTag(params.lang);

  if (!validLang) {
    let [latest] = await getVersions();

    let actualPath = path.resolve(
      `/docs/en`,
      latest.head,
      params.lang, // not actually a lang, but a directory
      params.version, // not actually a version, but a directory
      params["*"] ?? ""
    );

    throw redirect(actualPath);
  }
}

export { ensureLangAndVersion };

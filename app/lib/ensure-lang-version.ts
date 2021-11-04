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

async function ensureLang(lang: string) {
  let [latest] = await getVersions();

  let validLang = locale.getByTag(lang);

  // If it's not a valid tag, it's a shortcut to a doc
  // "/docs/api" -> "/docs/en/v6/api"
  if (!validLang) {
    let [latest] = await getVersions();
    let doc = lang;
    let actualPath = `/docs/en/${latest.head}/${doc}`;
    return redirect(actualPath);
  }

  // otherwise just go to "/docs/en/v6"
  return redirect(`/docs/en/${latest.head}`);
}

export { ensureLangAndVersion, ensureLang };

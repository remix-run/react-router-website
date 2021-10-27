import acceptLanguage from "accept-language";
import { LoaderFunction, redirect } from "remix";
import { prismaRead as prisma } from "~/db.server";
import { getVersions } from "~/utils.server";

export let loader: LoaderFunction = async ({ params, request }) => {
  let lang = params.lang;
  let [latest] = await getVersions();

  // 1. we have a language in the url
  if (lang) {
    return redirect(`/docs/${lang}/${latest.head}`);
  }

  // 2. get the user's preferred language
  let langHeader = request.headers.get("accept-language");
  // 2.1 if the user doesn't have a preferred language, redirect to english
  if (!langHeader) {
    return redirect(`/docs/en/${latest.head}`);
  }

  // 3. get all the languages of docs we have
  let docs = await prisma.doc.findMany({ select: { lang: true } });
  let langs = [...new Set(docs.map((d) => d.lang))];

  acceptLanguage.languages(langs);
  // 4. get the user's preferred language from the list of languages we have
  let preferred = acceptLanguage.get(langHeader);
  // 4.1 if the user's preferred language is not in the list of languages we have, redirect to english
  if (!preferred) {
    return redirect(`/docs/en/${latest.head}`);
  }

  // 5. redirect to the user's preferred language
  return redirect(`/docs/${preferred}/${latest.head}`);
};

export default function Docs() {
  return null;
}

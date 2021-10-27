import { RouteComponent, ActionFunction, json } from "remix";

import type { GitHubRelease } from "~/@types/github";

import { saveDocs } from "~/utils/save-docs";

let action: ActionFunction = async ({ request }) => {
  const url = new URL(request.url);

  if (request.method !== "POST") {
    throw new Response("", { status: 405 });
  }

  if (
    // verify post request and the token matches or doing it locally
    request.headers.get("Authorization") !== process.env.AUTH_TOKEN ||
    url.hostname !== "localhost"
  ) {
    throw new Response("", { status: 401 });
  }

  const ref = url.searchParams.get("ref");

  if (!ref) {
    throw new Response("", { status: 400 });
  }

  console.log(`Refreshing docs for ref ${ref}`);

  try {
    let tag = ref.replace(/^refs\/tags\//, "");

    const releasePromise = await fetch(
      `https://api.github.com/repos/${process.env.REPO}/releases/tags/${tag}`,
      {
        headers: {
          accept: "application/vnd.github.v3+json",
        },
      }
    );

    const release = (await releasePromise.json()) as GitHubRelease;

    await saveDocs(ref, release.body);

    return json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error(error);
    return json({ ok: true }, { status: 500 });
  }
};

const RefreshDocsPage: RouteComponent = () => null;

export default RefreshDocsPage;
export { action };

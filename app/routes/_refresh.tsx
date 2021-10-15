import { RouteComponent, ActionFunction, json } from "remix";
import { getInstanceURLs } from "~/utils/get-fly-instance-urls.server";

const action: ActionFunction = async ({ request }) => {
  // verify post request and the token matches
  if (request.method !== "POST") {
    return json({}, { status: 405 });
  }
  if (request.headers.get("Authorization") !== process.env.AUTH_TOKEN) {
    return json({}, { status: 401 });
  }

  const { search, searchParams } = new URL(request.url);

  console.log(
    `Refreshing docs for all instances for ref ${searchParams.get("ref")}`
  );

  try {
    // get all app instances and refresh them
    const instances = await getInstanceURLs();

    const results = await Promise.allSettled(
      instances.map(async (instance) => {
        const url = new URL(instance);
        url.pathname = "/_refreshlocal";
        url.search = search;

        console.log(`forwarding post to ${url.toString()}`);

        return fetch(url.toString(), {
          method: "POST",
          headers: {
            Authorization: process.env.AUTH_TOKEN!,
          },
        });
      })
    );

    results.forEach((result) => {
      console.info(result);
    });

    return json({ ok: true });
  } catch (error) {
    console.error(error);
    return json({ ok: false }, { status: 500 });
  }
};

const RefreshAllInstancesDocsPage: RouteComponent = () => {
  return <p>404</p>;
};

export default RefreshAllInstancesDocsPage;
export { action };

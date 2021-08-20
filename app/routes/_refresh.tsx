import type { RouteComponent, ActionFunction } from "remix";
import { redirect } from "remix";
import { getInstanceURLs } from "../utils/get-fly-instance-urls.server";

const action: ActionFunction = async ({ request }) => {
  let token = request.headers.get("Authorization");
  // verify post request and the token matches
  if (
    request.method !== "POST" ||
    (process.env.NODE_ENV !== "development" && token !== process.env.AUTH_TOKEN)
  ) {
    return redirect("/");
  }

  const url = new URL(request.url);

  try {
    // get all app instances and refresh them
    const instances = await getInstanceURLs();

    const results = await Promise.allSettled(
      instances.map(async (instance) => {
        return fetch(instance + "/_refreshlocal" + url.search, {
          method: "POST",
          headers: {
            Authorization: process.env.AUTH_TOKEN!,
          },
        });
      })
    );

    results.forEach((result) => {
      console.log(result);
    });

    return redirect("/success");
  } catch (error) {
    console.error(error);
    return redirect("/sad");
  }
};

const RefreshAllInstancesDocsPage: RouteComponent = () => {
  return <p>404</p>;
};

export default RefreshAllInstancesDocsPage;
export { action };

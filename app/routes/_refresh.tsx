import type { RouteComponent, ActionFunction } from "remix";
import { redirect } from "remix";
import { getInstanceURLs } from "../utils/get-fly-instance-urls.server";

const action: ActionFunction = async ({ request }) => {
  let token = request.headers.get("Authorization");
  // verify post request and the token matches
  if (
    request.method !== "POST"
    // || (process.env.NODE_ENV !== "development" && token !== process.env.AUTH_TOKEN)
  ) {
    return redirect("/");
  }

  const { search } = new URL(request.url);

  try {
    // get all app instances and refresh them
    const instances = await getInstanceURLs();

    const results = await Promise.allSettled(
      instances.map(async (instance) => {
        const url = new URL(instance);
        url.pathname = "/_refreshlocal";
        url.search = search;

        return fetch(url.toString(), {
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

    return redirect("/_refresh");
  } catch (error) {
    console.error(error);
    return redirect("/_refresh");
  }
};

const RefreshAllInstancesDocsPage: RouteComponent = () => {
  return (
    <form
      method="post"
      className="h-screen flex flex-col justify-center items-center"
    >
      <button
        className="text-3xl bg-purple-500 rounded-xl px-4 py-1 text-white hover:bg-purple-600 transition-colors duration-150 ease-in-out"
        type="submit"
      >
        Refresh All Instances!
      </button>
    </form>
  );
};

export default RefreshAllInstancesDocsPage;
export { action };

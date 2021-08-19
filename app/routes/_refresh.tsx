import type { RouteComponent, ActionFunction } from "remix";
import { redirect } from "remix";

const action: ActionFunction = async ({ request }) => {
  // verify post request and the token matches
  if (request.method !== "POST") {
    return redirect("/");
  }

  try {
    // get all app instances and refresh them
    const url = new URL(request.url);

    if (process.env.NODE_ENV === "development") {
      url.port = "3000";
    }

    url.pathname = "/_refreshlocal";

    await fetch(url.toString(), {
      method: "POST",
      headers: {
        Authorization: "some-token",
      },
    });

    return redirect("/success");
  } catch (error) {
    console.error(error);
    return redirect("/sad");
  }
};

const RefreshAllInstancesDocsPage: RouteComponent = () => {
  return null;
};

export default RefreshAllInstancesDocsPage;
export { action };

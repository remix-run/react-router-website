import { menuCollapseContext } from "./server";
import type { Route } from "./+types/route";

export async function action({ request, context }: Route.ActionArgs) {
  let formData = await request.formData();
  let category = formData.get("category");
  if (!category || typeof category !== "string") {
    return new Response("Name is required", { status: 400 });
  }

  let open = formData.get("open");
  if (open !== "true" && open !== "false") {
    return new Response("Open must be true or false", { status: 400 });
  }

  let parsedOpen = open === "true";

  let menuCollapse = menuCollapseContext(context);
  menuCollapse.set(category, parsedOpen);

  return parsedOpen;
}

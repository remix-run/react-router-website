import { setSidebarState } from "~/modules/sidebar-state.server";
import type { Route } from "./+types/sidebar";

export async function action({ request }: Route.ActionArgs) {
  console.log("action!");
  let formData = await request.formData();
  let name = formData.get("name");
  let open = formData.get("open");
  if (!name || typeof name !== "string") {
    return new Response("Name is required", { status: 400 });
  }
  if (open === "true" || open === "false") {
    setSidebarState(name, open === "true");
  }
  return open === "true";
}

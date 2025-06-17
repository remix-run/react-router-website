import { redirect } from "react-router";
import { serializeColorScheme } from "./server";
import type { Route } from "./+types/route";
import { getColorScheme } from "./components";

export async function action({ request }: Route.ActionArgs) {
  let formData = await request.formData();
  let colorScheme = getColorScheme(formData);
  let returnTo = safeRedirect(formData.get("returnTo"));

  if (!colorScheme) {
    throw new Response("Bad Request", { status: 400 });
  }

  return redirect(returnTo, {
    headers: { "Set-Cookie": await serializeColorScheme(colorScheme) },
  });
}

function safeRedirect(to: FormDataEntryValue | null) {
  if (!to || typeof to !== "string") {
    return "/";
  }

  if (!to.startsWith("/") || to.startsWith("//")) {
    return "/";
  }

  return to;
}

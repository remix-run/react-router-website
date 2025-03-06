import { menuCollapseContext } from "~/modules/menu-collapse.server";
import type { Route } from "./+types/update-menu-collapse";
import type { Info as RootInfo } from "../+types/root";
import { useRouteLoaderData, useSubmit } from "react-router";
import invariant from "tiny-invariant";
import { useCallback, useState } from "react";

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

  menuCollapseContext(context).set(category, parsedOpen);
  return parsedOpen;
}

export function useMenuCollapse(category?: string) {
  const rootLoaderData = useRouteLoaderData<RootInfo["loaderData"]>("root");
  invariant(rootLoaderData, "No root loader data found");

  const isMenuOpen = category
    ? (rootLoaderData.menuCollapseState[category] ?? true)
    : true;
  const [isOpen, setIsOpen] = useState(isMenuOpen);
  const submit = useSubmit();

  const submitMenuCollapse = useCallback(
    (open: boolean) => {
      // fire and forget, assume that the submit will succeed and just update the ephemeral state
      setIsOpen(open);

      if (!category) return;
      return submit(
        { category, open: String(open) },
        {
          navigate: false,
          method: "post",
          action: "/_update-menu-collapse",
        },
      );
    },
    [category, submit],
  );

  return [isOpen, submitMenuCollapse] as const;
}

import { useMatches, useTransition } from "@remix-run/react";

export function useOptimisticColorScheme() {
  let rootLoaderData = useMatches()[0].data;
  let transition = useTransition();
  let optimisticColorScheme =
    transition.submission?.formData.get("colorScheme");
  return optimisticColorScheme || rootLoaderData.colorScheme;
}

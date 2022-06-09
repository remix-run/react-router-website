import { useEffect, useMemo } from "react";
import { useMatches, useTransition } from "@remix-run/react";
import type { ColorScheme } from "./types";

export function useColorScheme(): ColorScheme {
  let rootLoaderData = useMatches()[0].data;
  let { submission } = useTransition();
  let optimisticColorScheme =
    submission && submission.formData.has("colorScheme")
      ? (submission.formData.get("colorScheme") as ColorScheme)
      : null;
  return optimisticColorScheme || rootLoaderData.colorScheme;
}

export function ColorSchemeScript() {
  let colorScheme = useColorScheme();

  let script = useMemo(
    () => `
      let colorScheme = ${JSON.stringify(colorScheme)};
      if (colorScheme === "system") {
        let media = window.matchMedia("(prefers-color-scheme: dark)")
        if (media.matches) document.documentElement.classList.add("dark");
      }
    `,
    [] // eslint-disable-line
    // we don't want this script to ever change
  );

  useEffect(() => {
    if (colorScheme === "system") {
      let media = window.matchMedia("(prefers-color-scheme: dark)");
      function check(media: MediaQueryList) {
        if (media.matches) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
      // I can't figure out what the crap TypeScript wants here ...
      // @ts-expect-error
      media.addEventListener("change", check);
      // @ts-expect-error
      return () => media.removeEventListener("change", check);
    }
  }, [colorScheme]);

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}

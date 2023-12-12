import { useLayoutEffect, useMemo } from "react";
import type { SerializeFrom } from "@remix-run/node";
import { useMatches, useNavigation } from "@remix-run/react";
import type { loader as rootLoader } from "../../root";
import type { ColorScheme } from "./types";

export function useColorScheme(): ColorScheme {
  let rootLoaderData = useMatches()[0].data as SerializeFrom<typeof rootLoader>;
  let { formData } = useNavigation();
  let optimisticColorScheme =
    formData && formData.has("colorScheme")
      ? (formData.get("colorScheme") as ColorScheme)
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

  if (typeof document !== "undefined") {
    // eslint-disable-next-line
    useLayoutEffect(() => {
      if (colorScheme === "light") {
        document.documentElement.classList.remove("dark");
      } else if (colorScheme === "dark") {
        document.documentElement.classList.add("dark");
      } else if (colorScheme === "system") {
        function check(media: MediaQueryList) {
          if (media.matches) {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
        }

        let media = window.matchMedia("(prefers-color-scheme: dark)");
        check(media);

        // @ts-expect-error I can't figure out what TypeScript wants here ...
        media.addEventListener("change", check);
        // @ts-expect-error
        return () => media.removeEventListener("change", check);
      } else {
        console.error("Impossible color scheme state:", colorScheme);
      }
    }, [colorScheme]);
  }

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}

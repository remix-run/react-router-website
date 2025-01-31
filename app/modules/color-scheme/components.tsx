import { useLayoutEffect, useMemo } from "react";
import { useNavigation, useRouteLoaderData } from "react-router";
import type { loader as rootLoader } from "../../root";
import type { ColorScheme } from "./types";

export function useColorScheme(): ColorScheme {
  let rootLoaderData = useRouteLoaderData<typeof rootLoader>("root");
  if (!rootLoaderData) {
    throw new Error("useColorScheme must be used within a root loader");
  }

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
    [], // eslint-disable-line
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
        function check(media: MediaQueryList | MediaQueryListEvent) {
          if (media.matches) {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
        }

        let media = window.matchMedia("(prefers-color-scheme: dark)");
        check(media);

        media.addEventListener("change", check);
        return () => media.removeEventListener("change", check);
      } else {
        console.error("Impossible color scheme state:", colorScheme);
      }
    }, [colorScheme]);
  }

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}

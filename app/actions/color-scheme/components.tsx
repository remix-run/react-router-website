import { useLayoutEffect, useMemo } from "react";
import { unstable_useRoute as useRoute } from "react-router";
import type { ColorScheme } from "./utils";

export function useColorScheme(): ColorScheme {
  let rootRoute = useRoute("root");
  return rootRoute.loaderData?.colorScheme ?? "system";
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
      applyColorScheme(colorScheme);
      if (colorScheme !== "system") return;

      let media = window.matchMedia("(prefers-color-scheme: dark)");
      let check = () => applyColorScheme("system");
      media.addEventListener("change", check);
      return () => media.removeEventListener("change", check);
    }, [colorScheme]);
  }

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}

export function applyColorScheme(colorScheme: ColorScheme) {
  let isDark =
    colorScheme === "dark" ||
    (colorScheme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", isDark);
}

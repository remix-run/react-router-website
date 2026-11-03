export type ColorScheme = "dark" | "light" | "system";

export function getColorScheme(formData: FormData): ColorScheme | null {
  let colorScheme = formData.get("colorScheme");

  if (
    colorScheme === "dark" ||
    colorScheme === "light" ||
    colorScheme === "system"
  ) {
    return colorScheme;
  }

  return null;
}

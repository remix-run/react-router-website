import { installGlobals } from "@remix-run/node";

import { ensureLangAndVersion } from "~/lib/ensure-lang-version";

installGlobals();

it("ensures that a lang and version param exist and are valid", async () => {
  const result = await ensureLangAndVersion({
    lang: "en",
    version: "v6",
    "*": "getting-started/installation",
  });

  expect(result).toBe(undefined);
});

it("redirects to a given path when the lang isn't valid", async () => {
  expect.assertions(1);

  try {
    await ensureLangAndVersion({
      lang: "getting-started",
      version: "installation",
      "*": undefined,
    });
  } catch (error: unknown) {
    if (error instanceof Response) {
      expect(error.headers.get("Location")).toBe(
        "/docs/en/v6/getting-started/installation"
      );
    } else {
      throw error;
    }
  }
});

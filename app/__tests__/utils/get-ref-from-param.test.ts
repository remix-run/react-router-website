import { getRefFromParam } from "../../utils/get-ref-from-param";

it("returns the correct ref", () => {
  let refs = [
    "v6.0.0-beta.8",
    "v6.0.0",
    "v6.1.0",
    "main",
    "dev",
    "v5.2.0",
    "v5.2.1",
    "v5.3.0",
    "v0.19.0",
    "v0.19.2",
  ];
  expect(getRefFromParam("v6", refs, "refs/heads/main")).toBe(
    "refs/heads/main"
  );
  expect(getRefFromParam("dev", refs, "refs/heads/main")).toBe(
    "refs/heads/dev"
  );
  expect(getRefFromParam("v6.0.0", refs, "refs/heads/main")).toBe(
    "refs/tags/v6.0.0"
  );
  expect(getRefFromParam("v5", refs, "refs/heads/main")).toBe(
    "refs/tags/v5.3.0"
  );
  expect(getRefFromParam("v5.2.0", refs, "refs/heads/main")).toBe(
    "refs/tags/v5.2.0"
  );
  expect(getRefFromParam("v5.2", refs, "refs/heads/main")).toBe(
    "refs/tags/v5.2.1"
  );
  expect(getRefFromParam("v0.19", refs, "refs/heads/main")).toBe(
    "refs/tags/v0.19.2"
  );
  expect(getRefFromParam("v4", refs, "refs/heads/main")).toBe(null);
  expect(getRefFromParam("v6.0.1", refs, "refs/heads/main")).toBe(null);
  expect(getRefFromParam("v7", refs, "refs/heads/main")).toBe(null);
  expect(getRefFromParam("v7.0.1", refs, "refs/heads/main")).toBe(null);
});

it("returns the correct ref when we only have pre-releases", () => {
  let refs = [
    "v6.0.0-beta.8",
    "main",
    "dev",
    "v5.2.0",
    "v5.2.1",
    "v5.3.0",
    "v0.19.0",
    "v0.19.2",
  ];

  expect(getRefFromParam("v6", refs, "refs/heads/main")).toBe(
    "refs/heads/main"
  );
});

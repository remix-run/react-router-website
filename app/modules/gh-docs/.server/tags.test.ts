import { describe, expect, it } from "vitest";
import { getLatestMajorVersions } from "./tags";

describe("getLatestMajorVersions", () => {
  it("returns the latest stable version for each major", () => {
    expect(
      getLatestMajorVersions([
        "5.3.4",
        "6.30.1",
        "7.0.0",
        "7.9.6",
        "8.0.0-pre.0",
      ]),
    ).toEqual(["7.9.6", "6.30.1"]);
  });

  it("automatically adds v8 when a stable release exists", () => {
    expect(
      getLatestMajorVersions(["6.30.1", "7.9.6", "8.0.0-pre.0", "8.0.0"]),
    ).toEqual(["8.0.0", "7.9.6", "6.30.1"]);
  });
});

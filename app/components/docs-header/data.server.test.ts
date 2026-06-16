import { describe, expect, it } from "vitest";
import { getHeaderData } from "./data.server";

describe("getHeaderData", () => {
  it("uses v7 as the current major before v8 is released", () => {
    expect(
      getHeaderData("en", "7.9.6", ["7.9.6", "6.30.1", "5.3.4"]),
    ).toMatchObject({
      versions: ["7.9.6", "6.30.1"],
      latestVersion: "7.9.6",
      hasAPIDocs: true,
      apiDocsRef: "v7",
      docSearchVersion: "v7",
      shouldIndexDocPage: true,
    });
  });

  it("uses v8 as the current major after v8 is released", () => {
    expect(
      getHeaderData("en", "8.0.0", [
        "8.0.0",
        "8.0.0-pre.0",
        "7.9.6",
        "6.30.1",
        "5.3.4",
      ]),
    ).toMatchObject({
      versions: ["8.0.0", "7.9.6", "6.30.1"],
      latestVersion: "8.0.0",
      hasAPIDocs: true,
      apiDocsRef: "v8",
      docSearchVersion: "v8",
      shouldIndexDocPage: true,
    });
  });

  it("keeps previous v7 docs searchable without indexing them as current", () => {
    expect(
      getHeaderData("en", "7.9.6", ["8.0.0", "7.9.6", "6.30.1"], "7.9.6"),
    ).toMatchObject({
      hasAPIDocs: true,
      apiDocsRef: "v7",
      docSearchVersion: "v7",
      shouldIndexDocPage: false,
    });
  });

  it("uses the latest API docs for branch refs", () => {
    expect(
      getHeaderData("en", "main", ["8.0.0", "7.9.6", "6.30.1"], "main"),
    ).toMatchObject({
      hasAPIDocs: true,
      apiDocsRef: "v8",
      docSearchVersion: "v8",
      shouldIndexDocPage: false,
    });
  });

  it("keeps v6 releases searchable as legacy docs", () => {
    expect(
      getHeaderData("en", "6.28.0", ["8.0.0", "7.9.6", "6.30.1"], "6.28.0"),
    ).toMatchObject({
      hasAPIDocs: false,
      apiDocsRef: null,
      docSearchVersion: "v6",
      shouldIndexDocPage: false,
    });
  });
});

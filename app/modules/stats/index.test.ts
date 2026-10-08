import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getStatsPlaceholder } from "./index";

describe("stats placeholders", () => {
  beforeEach(() => {
    statCountsCache.clear();
  });

  afterEach(() => {
    statCountsCache.clear();
    vi.restoreAllMocks();
  });

  it("uses current digit lengths without fetching on a cold cache", () => {
    const fetch = vi.spyOn(statCountsCache, "fetch");
    const placeholders = getStatsPlaceholder();
    expect(placeholders.map(({ count }) => count)).toEqual([
      "-,---,---,---",
      "-,---",
      "--,---",
      "-,---,---",
    ]);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("matches cached digit lengths, including zero and digit-boundary changes", () => {
    statCountsCache.set("ONE_STATS_KEY_TO_RULE_THEM_ALL", {
      npmDownloads: 10000000000,
      githubContributors: 999,
      githubStars: 0,
      githubDependents: 10000000,
    });
    expect(getStatsPlaceholder().map(({ count }) => count)).toEqual([
      "--,---,---,---",
      "---",
      "-",
      "--,---,---",
    ]);
  });
});

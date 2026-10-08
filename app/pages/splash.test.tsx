import { beforeEach, describe, expect, it, vi } from "vitest";
import { Suspense, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const { getStats, getStatsPlaceholder, getRepoTags } = vi.hoisted(() => ({
  getStats: vi.fn(),
  getStatsPlaceholder: vi.fn(),
  getRepoTags: vi.fn(),
}));
vi.mock("~/modules/stats", () => ({ getStats, getStatsPlaceholder }));
vi.mock("~/modules/gh-docs/.server", () => ({ getRepoTags }));

import { loader } from "./splash";

describe("splash stats streaming", () => {
  const stat = { count: 12345, label: "Example stat", svgId: "stat-download" };

  beforeEach(() => {
    getStats.mockReset();
    getStatsPlaceholder
      .mockReset()
      .mockReturnValue([{ ...stat, count: "--,---" }]);
    getRepoTags.mockReset();
  });

  it("starts stats and version fetching together without awaiting stats", async () => {
    let resolveTags!: (tags: string[]) => void;
    getRepoTags.mockReturnValue(
      new Promise<string[]>((resolve) => {
        resolveTags = resolve;
      }),
    );
    getStats.mockReturnValue(new Promise(() => {}));

    const pending = loader();
    expect(getStats).toHaveBeenCalledOnce();
    expect(getRepoTags).toHaveBeenCalledOnce();

    resolveTags(["8.4.0"]);
    const data = await pending;
    // This placement protects against blocking the entire Flight payload.
    expect(data.stats.type).toBe(Suspense);
  });

  it("renders accessible loading placeholders and formatted loaded counts", async () => {
    getStats.mockResolvedValue([stat]);
    getRepoTags.mockResolvedValue(["8.4.0"]);
    const data = await loader();
    const fallback = data.stats.props.fallback;
    const pending = data.stats.props.children;
    const loaded = await pending.type(pending.props);

    const skeletonHtml = renderToStaticMarkup(fallback);
    const loadedHtml = renderToStaticMarkup(loaded);
    expect(skeletonHtml).toContain('aria-busy="true"');
    expect(skeletonHtml).toContain("--,---");
    expect(skeletonHtml).toContain(stat.label);
    expect(loadedHtml).toContain("12,345");
    expect(loadedHtml).toContain(stat.label);
    expect(loadedHtml).toContain('aria-busy="false"');
  });

  it("omits supplementary stats when fetching fails", async () => {
    getStats.mockRejectedValue(new Error("Stats unavailable"));
    getRepoTags.mockResolvedValue(["8.4.0"]);

    const data = await loader();
    const stats = data.stats.props.children as ReactElement<{
      stats: Promise<unknown>;
    }>;
    const renderStats = stats.type as (
      props: typeof stats.props,
    ) => Promise<React.ReactNode>;
    expect(await renderStats(stats.props)).toBeNull();
  });
});

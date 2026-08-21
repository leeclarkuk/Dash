import { describe, expect, it } from "vitest";
import { humaniseRepoName, mapGitHubRepo, repoToServiceKey } from "./map-repo";

describe("repoToServiceKey", () => {
  it("normalises GitHub names to service keys", () => {
    expect(repoToServiceKey("Payments_API")).toBe("payments-api");
    expect(repoToServiceKey("  Edge Gateway  ")).toBe("edge-gateway");
  });
});

describe("humaniseRepoName", () => {
  it("turns kebab names into titles", () => {
    expect(humaniseRepoName("payments-api")).toBe("Payments Api");
  });
});

describe("mapGitHubRepo", () => {
  const base = {
    id: 1,
    name: "payments-api",
    full_name: "keel/payments-api",
    description: "Card authorisation",
    html_url: "https://github.com/keel/payments-api",
    default_branch: "main",
    language: "Go",
    private: true,
    fork: false,
    archived: false,
    topics: ["payments"],
    pushed_at: "2026-08-01T00:00:00Z",
  };

  it("maps a live repo onto a service", () => {
    const mapped = mapGitHubRepo(base);
    expect(mapped.skip).toBe(false);
    expect(mapped.serviceKey).toBe("payments-api");
    expect(mapped.visibility).toBe("private");
  });

  it("skips forks and archived repos", () => {
    expect(mapGitHubRepo({ ...base, fork: true }).skip).toBe(true);
    expect(mapGitHubRepo({ ...base, archived: true }).reason).toBe("archived");
  });
});

import { describe, expect, it } from "vitest";
import { evaluateCheck, evaluateScorecard, getField } from "./engine";
import { PRODUCTION_READINESS_RULES } from "./production-readiness";
import type { ServiceSnapshot } from "./types";

const gold: ServiceSnapshot = {
  key: "payments-api",
  name: "Payments API",
  description: "Authorises card payments.",
  lifecycle: "production",
  tier: "critical",
  docsUrl: "https://docs.example.test/payments",
  ownerTeam: { slug: "payments", name: "Payments" },
  repository: {
    fullName: "keel/payments-api",
    language: "Go",
    visibility: "private",
    hasReadme: true,
    hasCi: true,
    branchProtection: true,
    lastPushedAt: new Date().toISOString(),
    topics: ["payments"],
  },
};

describe("getField", () => {
  it("walks dotted paths", () => {
    expect(getField(gold, "repository.hasCi")).toBe(true);
    expect(getField(gold, "ownerTeam.name")).toBe("Payments");
    expect(getField(gold, "repository.missing")).toBeUndefined();
  });
});

describe("evaluateCheck", () => {
  it("treats blank strings as missing", () => {
    const snap: ServiceSnapshot = { ...gold, description: "  " };
    expect(evaluateCheck(snap, { field: "description", op: "exists" }).passed).toBe(
      false,
    );
  });

  it("compares freshness against a fixed now", () => {
    const snap: ServiceSnapshot = {
      ...gold,
      repository: {
        ...gold.repository!,
        lastPushedAt: "2026-01-01T00:00:00.000Z",
      },
    };
    const now = new Date("2026-08-21T00:00:00.000Z");
    expect(
      evaluateCheck(
        snap,
        { field: "repository.lastPushedAt", op: "newerThanDays", value: 90 },
        now,
      ).passed,
    ).toBe(false);
    expect(
      evaluateCheck(
        snap,
        { field: "repository.lastPushedAt", op: "newerThanDays", value: 365 },
        now,
      ).passed,
    ).toBe(true);
  });
});

describe("evaluateScorecard", () => {
  it("awards gold when every required rule passes", () => {
    const result = evaluateScorecard(gold, PRODUCTION_READINESS_RULES);
    expect(result.level).toBe("gold");
    expect(result.failed).toBe(0);
    expect(result.total).toBe(PRODUCTION_READINESS_RULES.length);
  });

  it("stops at bronze when CI is missing", () => {
    const snap: ServiceSnapshot = {
      ...gold,
      repository: { ...gold.repository!, hasCi: false },
    };
    const result = evaluateScorecard(snap, PRODUCTION_READINESS_RULES);
    expect(result.level).toBe("bronze");
    const ci = result.outcomes.find((o) => o.key === "has-ci");
    expect(ci?.passed).toBe(false);
  });

  it("is none when the owner is missing, even if everything else is green", () => {
    const snap: ServiceSnapshot = { ...gold, ownerTeam: null };
    const result = evaluateScorecard(snap, PRODUCTION_READINESS_RULES);
    expect(result.level).toBe("none");
  });

  it("ignores recommended rules when computing level", () => {
    const snap: ServiceSnapshot = { ...gold, docsUrl: null };
    const result = evaluateScorecard(snap, PRODUCTION_READINESS_RULES);
    expect(result.level).toBe("gold");
    expect(result.outcomes.find((o) => o.key === "has-docs")?.passed).toBe(false);
    expect(result.failed).toBe(1);
  });
});

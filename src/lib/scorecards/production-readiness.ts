import type { ScorecardRule } from "./types";

export const PRODUCTION_READINESS_SLUG = "production-readiness";

export const PRODUCTION_READINESS_RULES: ScorecardRule[] = [
  {
    key: "has-owner",
    title: "Has an owning team",
    description:
      "A service without an owner is an incident waiting for a mailing list.",
    level: "bronze",
    required: true,
    check: { field: "ownerTeam", op: "exists" },
  },
  {
    key: "has-description",
    title: "Has a description",
    description: "One sentence that tells a stranger what this service does.",
    level: "bronze",
    required: true,
    check: { field: "description", op: "exists" },
  },
  {
    key: "has-readme",
    title: "Has a README",
    description: "The repository has a README at the default branch root.",
    level: "bronze",
    required: true,
    check: { field: "repository.hasReadme", op: "eq", value: true },
  },
  {
    key: "has-ci",
    title: "Has CI",
    description: "GitHub Actions (or equivalent) is configured on the default branch.",
    level: "silver",
    required: true,
    check: { field: "repository.hasCi", op: "eq", value: true },
  },
  {
    key: "recently-pushed",
    title: "Pushed in the last 90 days",
    description:
      "A production service that has not moved in a quarter is either finished or forgotten. Dash assumes forgotten.",
    level: "silver",
    required: true,
    check: {
      field: "repository.lastPushedAt",
      op: "newerThanDays",
      value: 90,
    },
  },
  {
    key: "branch-protection",
    title: "Default branch is protected",
    description: "No direct pushes to the default branch.",
    level: "gold",
    required: true,
    check: { field: "repository.branchProtection", op: "eq", value: true },
  },
  {
    key: "has-docs",
    title: "Has a docs URL",
    description: "A link to runbooks or product docs, not just the README.",
    level: "gold",
    required: false,
    check: { field: "docsUrl", op: "exists" },
  },
];

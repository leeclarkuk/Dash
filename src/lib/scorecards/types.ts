export type RuleOp =
  | "exists"
  | "eq"
  | "neq"
  | "gt"
  | "gte"
  | "truthy"
  | "falsy"
  | "olderThanDays"
  | "newerThanDays";

export type RuleCheck = {
  field: string;
  op: RuleOp;
  value?: unknown;
};

export type RuleLevel = "bronze" | "silver" | "gold";

export type ScorecardRule = {
  key: string;
  title: string;
  description: string;
  level: RuleLevel;
  required: boolean;
  check: RuleCheck;
};

export type RepositorySnapshot = {
  fullName: string;
  language: string | null;
  visibility: "public" | "private";
  hasReadme: boolean;
  hasCi: boolean;
  branchProtection: boolean;
  lastPushedAt: string | null;
  topics: string[];
};

export type ServiceSnapshot = {
  key: string;
  name: string;
  description: string | null;
  lifecycle: "experimental" | "production" | "deprecated";
  tier: "critical" | "standard" | "internal";
  docsUrl: string | null;
  ownerTeam: { slug: string; name: string } | null;
  repository: RepositorySnapshot | null;
};

export type RuleOutcome = {
  key: string;
  title: string;
  description: string;
  level: RuleLevel;
  required: boolean;
  passed: boolean;
  message: string;
};

export type ScoreLevel = "none" | "bronze" | "silver" | "gold";

export type ScorecardEvaluation = {
  passed: number;
  failed: number;
  total: number;
  level: ScoreLevel;
  outcomes: RuleOutcome[];
};

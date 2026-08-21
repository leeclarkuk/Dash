import type {
  RuleCheck,
  RuleOutcome,
  ScoreLevel,
  ScorecardEvaluation,
  ScorecardRule,
  ServiceSnapshot,
} from "./types";

export function getField(snapshot: ServiceSnapshot, path: string): unknown {
  const parts = path.split(".");
  let current: unknown = snapshot;
  for (const part of parts) {
    if (current == null || typeof current !== "object") {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

function isPresent(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function daysSince(iso: string, now: Date): number {
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return Number.POSITIVE_INFINITY;
  return (now.getTime() - then.getTime()) / (1000 * 60 * 60 * 24);
}

export function evaluateCheck(
  snapshot: ServiceSnapshot,
  check: RuleCheck,
  now: Date = new Date(),
): { passed: boolean; actual: unknown } {
  const actual = getField(snapshot, check.field);

  switch (check.op) {
    case "exists":
      return { passed: isPresent(actual), actual };
    case "truthy":
      return { passed: Boolean(actual), actual };
    case "falsy":
      return { passed: !actual, actual };
    case "eq":
      return { passed: actual === check.value, actual };
    case "neq":
      return { passed: actual !== check.value, actual };
    case "gt": {
      const n = asNumber(actual);
      const target = asNumber(check.value);
      return {
        passed: n != null && target != null && n > target,
        actual,
      };
    }
    case "gte": {
      const n = asNumber(actual);
      const target = asNumber(check.value);
      return {
        passed: n != null && target != null && n >= target,
        actual,
      };
    }
    case "olderThanDays": {
      if (typeof actual !== "string" || !actual) {
        return { passed: false, actual };
      }
      const days = asNumber(check.value);
      if (days == null) return { passed: false, actual };
      return { passed: daysSince(actual, now) > days, actual };
    }
    case "newerThanDays": {
      if (typeof actual !== "string" || !actual) {
        return { passed: false, actual };
      }
      const days = asNumber(check.value);
      if (days == null) return { passed: false, actual };
      return { passed: daysSince(actual, now) <= days, actual };
    }
    default: {
      const _exhaustive: never = check.op;
      return { passed: false, actual: _exhaustive };
    }
  }
}

function messageFor(rule: ScorecardRule, passed: boolean, actual: unknown): string {
  if (passed) {
    return rule.check.op === "exists"
      ? "Present."
      : `Passed (${formatActual(actual)}).`;
  }

  switch (rule.check.op) {
    case "exists":
      return `Missing ${rule.check.field}.`;
    case "eq":
      return `Expected ${String(rule.check.value)}, got ${formatActual(actual)}.`;
    case "newerThanDays":
      return actual
        ? `Last activity ${formatActual(actual)} is older than ${String(rule.check.value)} days.`
        : `No timestamp on ${rule.check.field}.`;
    case "truthy":
      return `${rule.check.field} is false.`;
    default:
      return `Failed ${rule.check.op} on ${rule.check.field}.`;
  }
}

function formatActual(value: unknown): string {
  if (value == null) return "empty";
  if (typeof value === "string") return value;
  if (typeof value === "boolean" || typeof value === "number") return String(value);
  if (typeof value === "object" && value !== null && "name" in value) {
    return String((value as { name: unknown }).name);
  }
  try {
    return JSON.stringify(value);
  } catch {
    return "unprintable";
  }
}

const LEVEL_ORDER: ScoreLevel[] = ["none", "bronze", "silver", "gold"];

export function evaluateScorecard(
  snapshot: ServiceSnapshot,
  rules: ScorecardRule[],
  now: Date = new Date(),
): ScorecardEvaluation {
  const outcomes: RuleOutcome[] = rules.map((rule) => {
    const { passed, actual } = evaluateCheck(snapshot, rule.check, now);
    return {
      key: rule.key,
      title: rule.title,
      description: rule.description,
      level: rule.level,
      required: rule.required,
      passed,
      message: messageFor(rule, passed, actual),
    };
  });

  const passed = outcomes.filter((o) => o.passed).length;
  const failed = outcomes.length - passed;

  const requiredByLevel = {
    bronze: outcomes.filter((o) => o.required && o.level === "bronze"),
    silver: outcomes.filter((o) => o.required && o.level === "silver"),
    gold: outcomes.filter((o) => o.required && o.level === "gold"),
  };

  const allPass = (items: RuleOutcome[]) =>
    items.length === 0 || items.every((o) => o.passed);

  let level: ScoreLevel = "none";
  if (allPass(requiredByLevel.bronze) && requiredByLevel.bronze.length > 0) {
    level = "bronze";
    if (allPass(requiredByLevel.silver)) {
      level = "silver";
      if (allPass(requiredByLevel.gold)) {
        level = "gold";
      }
    }
  }

  return {
    passed,
    failed,
    total: outcomes.length,
    level,
    outcomes,
  };
}

export function levelRank(level: ScoreLevel): number {
  return LEVEL_ORDER.indexOf(level);
}

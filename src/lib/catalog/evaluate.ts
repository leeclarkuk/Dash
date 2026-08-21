import { eq } from "drizzle-orm";
import type { Database } from "@/db/client";
import { scorecardResults, scorecardRules, scorecards } from "@/db/schema";
import { evaluateScorecard } from "@/lib/scorecards/engine";
import type { ScorecardRule, ServiceSnapshot } from "@/lib/scorecards/types";
import { getCatalog } from "./queries";

export async function evaluateOrganization(db: Database, organizationId: string) {
  const catalog = await getCatalog(db, organizationId);
  const [scorecard] = await db
    .select()
    .from(scorecards)
    .where(eq(scorecards.organizationId, organizationId));
  if (!scorecard) return;

  const ruleRows = await db
    .select()
    .from(scorecardRules)
    .where(eq(scorecardRules.scorecardId, scorecard.id));

  const rules: ScorecardRule[] = ruleRows.map((row) => ({
    key: row.key,
    title: row.title,
    description: row.description,
    level: row.level as ScorecardRule["level"],
    required: row.required,
    check: row.check,
  }));

  for (const item of catalog) {
    const evaluation = evaluateScorecard(item.snapshot, rules);
    await db
      .insert(scorecardResults)
      .values({
        scorecardId: scorecard.id,
        serviceId: item.id,
        evaluatedAt: new Date(),
        passed: evaluation.passed,
        failed: evaluation.failed,
        total: evaluation.total,
        level: evaluation.level,
        details: evaluation.outcomes,
      })
      .onConflictDoUpdate({
        target: [scorecardResults.scorecardId, scorecardResults.serviceId],
        set: {
          evaluatedAt: new Date(),
          passed: evaluation.passed,
          failed: evaluation.failed,
          total: evaluation.total,
          level: evaluation.level,
          details: evaluation.outcomes,
        },
      });
  }
}

export async function evaluateService(
  db: Database,
  organizationId: string,
  serviceId: string,
  snapshot: ServiceSnapshot,
) {
  const [scorecard] = await db
    .select()
    .from(scorecards)
    .where(eq(scorecards.organizationId, organizationId));
  if (!scorecard) return null;

  const ruleRows = await db
    .select()
    .from(scorecardRules)
    .where(eq(scorecardRules.scorecardId, scorecard.id));

  const rules: ScorecardRule[] = ruleRows.map((row) => ({
    key: row.key,
    title: row.title,
    description: row.description,
    level: row.level as ScorecardRule["level"],
    required: row.required,
    check: row.check,
  }));

  const evaluation = evaluateScorecard(snapshot, rules);
  await db
    .insert(scorecardResults)
    .values({
      scorecardId: scorecard.id,
      serviceId,
      evaluatedAt: new Date(),
      passed: evaluation.passed,
      failed: evaluation.failed,
      total: evaluation.total,
      level: evaluation.level,
      details: evaluation.outcomes,
    })
    .onConflictDoUpdate({
      target: [scorecardResults.scorecardId, scorecardResults.serviceId],
      set: {
        evaluatedAt: new Date(),
        passed: evaluation.passed,
        failed: evaluation.failed,
        total: evaluation.total,
        level: evaluation.level,
        details: evaluation.outcomes,
      },
    });
  return evaluation;
}

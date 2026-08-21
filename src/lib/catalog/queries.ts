import { and, eq } from "drizzle-orm";
import type { Database } from "@/db/client";
import {
  repositories,
  scorecardResults,
  scorecardRules,
  scorecards,
  services,
  teams,
} from "@/db/schema";
import type {
  RepositorySnapshot,
  RuleOutcome,
  ScoreLevel,
  ServiceSnapshot,
} from "@/lib/scorecards/types";

export type CatalogItem = {
  id: string;
  key: string;
  name: string;
  description: string | null;
  lifecycle: ServiceSnapshot["lifecycle"];
  tier: ServiceSnapshot["tier"];
  docsUrl: string | null;
  source: string;
  owner: { id: string; slug: string; name: string } | null;
  repository: {
    id: string;
    fullName: string;
    url: string;
    language: string | null;
    visibility: "public" | "private";
  } | null;
  score: {
    level: ScoreLevel;
    passed: number;
    failed: number;
    total: number;
    evaluatedAt: string | null;
    outcomes: RuleOutcome[];
  } | null;
  snapshot: ServiceSnapshot;
};

function asLifecycle(value: string): ServiceSnapshot["lifecycle"] {
  if (value === "experimental" || value === "deprecated") return value;
  return "production";
}

function asTier(value: string): ServiceSnapshot["tier"] {
  if (value === "critical" || value === "internal") return value;
  return "standard";
}

function asVisibility(value: string): "public" | "private" {
  return value === "public" ? "public" : "private";
}

export async function getCatalog(db: Database, organizationId: string): Promise<CatalogItem[]> {
  const rows = await db
    .select({
      service: services,
      team: teams,
      repository: repositories,
      result: scorecardResults,
    })
    .from(services)
    .leftJoin(teams, eq(services.ownerTeamId, teams.id))
    .leftJoin(repositories, eq(repositories.serviceId, services.id))
    .leftJoin(scorecardResults, eq(scorecardResults.serviceId, services.id))
    .where(eq(services.organizationId, organizationId));

  return rows
    .map((row) => toCatalogItem(row.service, row.team, row.repository, row.result))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getService(
  db: Database,
  organizationId: string,
  key: string,
): Promise<CatalogItem | null> {
  const catalog = await getCatalog(db, organizationId);
  return catalog.find((item) => item.key === key) ?? null;
}

export async function getTeams(db: Database, organizationId: string) {
  const teamRows = await db.select().from(teams).where(eq(teams.organizationId, organizationId));
  const catalog = await getCatalog(db, organizationId);
  return teamRows
    .map((team) => ({
      ...team,
      services: catalog.filter((item) => item.owner?.id === team.id),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getTeam(db: Database, organizationId: string, slug: string) {
  const all = await getTeams(db, organizationId);
  return all.find((team) => team.slug === slug) ?? null;
}

export async function getScorecard(db: Database, organizationId: string) {
  const [scorecard] = await db
    .select()
    .from(scorecards)
    .where(eq(scorecards.organizationId, organizationId));
  if (!scorecard) return null;
  const rules = await db
    .select()
    .from(scorecardRules)
    .where(eq(scorecardRules.scorecardId, scorecard.id));
  const catalog = await getCatalog(db, organizationId);
  return {
    ...scorecard,
    rules,
    services: catalog,
    summary: {
      gold: catalog.filter((s) => s.score?.level === "gold").length,
      silver: catalog.filter((s) => s.score?.level === "silver").length,
      bronze: catalog.filter((s) => s.score?.level === "bronze").length,
      none: catalog.filter((s) => !s.score || s.score.level === "none").length,
      total: catalog.length,
    },
  };
}

export function toSnapshot(
  service: typeof services.$inferSelect,
  team: typeof teams.$inferSelect | null,
  repository: typeof repositories.$inferSelect | null,
): ServiceSnapshot {
  const repo: RepositorySnapshot | null = repository
    ? {
        fullName: repository.fullName,
        language: repository.language,
        visibility: asVisibility(repository.visibility),
        hasReadme: repository.hasReadme,
        hasCi: repository.hasCi,
        branchProtection: repository.branchProtection,
        lastPushedAt: repository.lastPushedAt?.toISOString() ?? null,
        topics: repository.topics ?? [],
      }
    : null;

  return {
    key: service.key,
    name: service.name,
    description: service.description,
    lifecycle: asLifecycle(service.lifecycle),
    tier: asTier(service.tier),
    docsUrl: service.docsUrl,
    ownerTeam: team ? { slug: team.slug, name: team.name } : null,
    repository: repo,
  };
}

function toCatalogItem(
  service: typeof services.$inferSelect,
  team: typeof teams.$inferSelect | null,
  repository: typeof repositories.$inferSelect | null,
  result: typeof scorecardResults.$inferSelect | null,
): CatalogItem {
  const snapshot = toSnapshot(service, team, repository);

  return {
    id: service.id,
    key: service.key,
    name: service.name,
    description: service.description,
    lifecycle: snapshot.lifecycle,
    tier: snapshot.tier,
    docsUrl: service.docsUrl,
    source: service.source,
    owner: team ? { id: team.id, slug: team.slug, name: team.name } : null,
    repository: repository
      ? {
          id: repository.id,
          fullName: repository.fullName,
          url: repository.url,
          language: repository.language,
          visibility: asVisibility(repository.visibility),
        }
      : null,
    score: result
      ? {
          level: result.level,
          passed: result.passed,
          failed: result.failed,
          total: result.total,
          evaluatedAt: result.evaluatedAt.toISOString(),
          outcomes: result.details,
        }
      : null,
    snapshot,
  };
}

export function serializeCatalogItem(item: CatalogItem) {
  return {
    key: item.key,
    name: item.name,
    description: item.description,
    lifecycle: item.lifecycle,
    tier: item.tier,
    docsUrl: item.docsUrl,
    owner: item.owner ? { slug: item.owner.slug, name: item.owner.name } : null,
    repository: item.repository
      ? {
          fullName: item.repository.fullName,
          url: item.repository.url,
          language: item.repository.language,
          visibility: item.repository.visibility,
        }
      : null,
    score: item.score
      ? {
          level: item.score.level,
          passed: item.score.passed,
          failed: item.score.failed,
          total: item.score.total,
          evaluatedAt: item.score.evaluatedAt,
          outcomes: item.score.outcomes,
        }
      : null,
  };
}

export { and, eq };

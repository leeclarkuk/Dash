import { nanoid } from "nanoid";
import type { Database } from "./client";
import {
  apiTokens,
  memberships,
  organizations,
  repositories,
  scorecardRules,
  scorecards,
  services,
  teams,
  users,
} from "./schema";
import { hashToken } from "@/lib/crypto";
import { PRODUCTION_READINESS_RULES, PRODUCTION_READINESS_SLUG } from "@/lib/scorecards/production-readiness";
import { evaluateOrganization } from "@/lib/catalog/evaluate";

export const DEMO_ORG_SLUG = "keel";
export const DEMO_USER_LOGIN = "demo";
export const DEMO_API_TOKEN = "dash_demo_keel_local_only";

type SeedService = {
  key: string;
  name: string;
  description: string | null;
  lifecycle: "experimental" | "production" | "deprecated";
  tier: "critical" | "standard" | "internal";
  owner: string | null;
  docsUrl: string | null;
  repo: {
    githubId: string;
    language: string | null;
    visibility: "public" | "private";
    hasReadme: boolean;
    hasCi: boolean;
    branchProtection: boolean;
    pushedDaysAgo: number | null;
    topics: string[];
  } | null;
};

const TEAM_SEED = [
  {
    slug: "platform",
    name: "Platform",
    description: "Golden paths, CI, and the catalogue itself.",
  },
  {
    slug: "payments",
    name: "Payments",
    description: "Authorisation, capture, and settlement.",
  },
  {
    slug: "checkout",
    name: "Checkout",
    description: "Buyer-facing web and the session API.",
  },
  {
    slug: "identity",
    name: "Identity",
    description: "Accounts, sessions, and partner SSO.",
  },
  {
    slug: "data",
    name: "Data",
    description: "Warehouses, fraud features, and exports.",
  },
];

const SERVICE_SEED: SeedService[] = [
  {
    key: "payments-api",
    name: "Payments API",
    description: "Authorises card payments and talks to the card scheme.",
    lifecycle: "production",
    tier: "critical",
    owner: "payments",
    docsUrl: "https://docs.keel.test/payments-api",
    repo: {
      githubId: "1001",
      language: "Go",
      visibility: "private",
      hasReadme: true,
      hasCi: true,
      branchProtection: true,
      pushedDaysAgo: 2,
      topics: ["payments", "pci"],
    },
  },
  {
    key: "payments-worker",
    name: "Payments Worker",
    description: "Captures authorised payments and retries settlement.",
    lifecycle: "production",
    tier: "critical",
    owner: "payments",
    docsUrl: "https://docs.keel.test/payments-worker",
    repo: {
      githubId: "1002",
      language: "Go",
      visibility: "private",
      hasReadme: true,
      hasCi: true,
      branchProtection: true,
      pushedDaysAgo: 4,
      topics: ["payments"],
    },
  },
  {
    key: "checkout-web",
    name: "Checkout Web",
    description: "Hosted checkout used by Keel merchants.",
    lifecycle: "production",
    tier: "critical",
    owner: "checkout",
    docsUrl: "https://docs.keel.test/checkout",
    repo: {
      githubId: "1003",
      language: "TypeScript",
      visibility: "private",
      hasReadme: true,
      hasCi: true,
      branchProtection: true,
      pushedDaysAgo: 1,
      topics: ["frontend"],
    },
  },
  {
    key: "identity-service",
    name: "Identity Service",
    description: "User accounts, API keys, and partner SSO.",
    lifecycle: "production",
    tier: "critical",
    owner: "identity",
    docsUrl: null,
    repo: {
      githubId: "1004",
      language: "Go",
      visibility: "private",
      hasReadme: true,
      hasCi: true,
      branchProtection: false,
      pushedDaysAgo: 8,
      topics: ["auth"],
    },
  },
  {
    key: "edge-gateway",
    name: "Edge Gateway",
    description: "TLS termination and routing for public APIs.",
    lifecycle: "production",
    tier: "critical",
    owner: "platform",
    docsUrl: "https://docs.keel.test/edge",
    repo: {
      githubId: "1005",
      language: "Go",
      visibility: "private",
      hasReadme: true,
      hasCi: true,
      branchProtection: true,
      pushedDaysAgo: 6,
      topics: ["edge"],
    },
  },
  {
    key: "audit-log",
    name: "Audit Log",
    description: "Append-only audit stream for privileged actions.",
    lifecycle: "production",
    tier: "standard",
    owner: "platform",
    docsUrl: null,
    repo: {
      githubId: "1006",
      language: "Rust",
      visibility: "private",
      hasReadme: true,
      hasCi: true,
      branchProtection: true,
      pushedDaysAgo: 12,
      topics: ["audit"],
    },
  },
  {
    key: "billing-exporter",
    name: "Billing Exporter",
    description: "Nightly usage export into the finance warehouse.",
    lifecycle: "production",
    tier: "standard",
    owner: "data",
    docsUrl: null,
    repo: {
      githubId: "1007",
      language: "Python",
      visibility: "private",
      hasReadme: true,
      hasCi: true,
      branchProtection: false,
      pushedDaysAgo: 20,
      topics: ["billing"],
    },
  },
  {
    key: "notifications",
    name: "Notifications",
    description: "Email and webhook delivery for merchant events.",
    lifecycle: "production",
    tier: "standard",
    owner: "checkout",
    docsUrl: null,
    repo: {
      githubId: "1008",
      language: "TypeScript",
      visibility: "private",
      hasReadme: true,
      hasCi: false,
      branchProtection: false,
      pushedDaysAgo: 15,
      topics: ["notifications"],
    },
  },
  {
    key: "status-page",
    name: "Status Page",
    description: "Public status.keel.test.",
    lifecycle: "production",
    tier: "internal",
    owner: "platform",
    docsUrl: null,
    repo: {
      githubId: "1009",
      language: "TypeScript",
      visibility: "public",
      hasReadme: true,
      hasCi: true,
      branchProtection: true,
      pushedDaysAgo: 30,
      topics: ["status"],
    },
  },
  {
    key: "design-system",
    name: "Design System",
    description: "Shared UI kit for Keel web apps.",
    lifecycle: "production",
    tier: "internal",
    owner: "checkout",
    docsUrl: null,
    repo: {
      githubId: "1010",
      language: "TypeScript",
      visibility: "private",
      hasReadme: true,
      hasCi: false,
      branchProtection: false,
      pushedDaysAgo: 40,
      topics: ["ui"],
    },
  },
  {
    key: "ml-fraud",
    name: "ML Fraud",
    description: null,
    lifecycle: "experimental",
    tier: "standard",
    owner: null,
    docsUrl: null,
    repo: {
      githubId: "1011",
      language: "Python",
      visibility: "private",
      hasReadme: false,
      hasCi: false,
      branchProtection: false,
      pushedDaysAgo: 120,
      topics: ["ml"],
    },
  },
  {
    key: "terraform-modules",
    name: "Terraform Modules",
    description: "Shared infrastructure modules. Not a runtime service, still in the catalogue because people page it.",
    lifecycle: "production",
    tier: "internal",
    owner: "platform",
    docsUrl: "https://docs.keel.test/terraform",
    repo: {
      githubId: "1012",
      language: "HCL",
      visibility: "private",
      hasReadme: true,
      hasCi: true,
      branchProtection: false,
      pushedDaysAgo: 200,
      topics: ["terraform"],
    },
  },
];

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

export async function seedIfEmpty(db: Database) {
  const existing = await db.select({ id: organizations.id }).from(organizations).limit(1);
  if (existing.length > 0) return;
  await seedDemo(db);
}

export async function seedDemo(db: Database) {
  const [org] = await db
    .insert(organizations)
    .values({ name: "Keel", slug: DEMO_ORG_SLUG })
    .returning();

  const [user] = await db
    .insert(users)
    .values({
      login: DEMO_USER_LOGIN,
      name: "Alex Reid",
      email: "alex@keel.test",
    })
    .returning();

  await db.insert(memberships).values({
    organizationId: org.id,
    userId: user.id,
    role: "owner",
  });

  const teamRows = await db
    .insert(teams)
    .values(
      TEAM_SEED.map((team) => ({
        organizationId: org.id,
        slug: team.slug,
        name: team.name,
        description: team.description,
      })),
    )
    .returning();

  const teamBySlug = new Map(teamRows.map((row) => [row.slug, row]));

  const [scorecard] = await db
    .insert(scorecards)
    .values({
      organizationId: org.id,
      slug: PRODUCTION_READINESS_SLUG,
      name: "Production readiness",
      description:
        "The minimum Dash expects of a service that takes production traffic. Bronze is ownership and docs in the repo. Silver adds CI and recent change. Gold adds branch protection.",
      kind: PRODUCTION_READINESS_SLUG,
    })
    .returning();

  await db.insert(scorecardRules).values(
    PRODUCTION_READINESS_RULES.map((rule) => ({
      scorecardId: scorecard.id,
      key: rule.key,
      title: rule.title,
      description: rule.description,
      level: rule.level,
      required: rule.required,
      check: rule.check,
    })),
  );

  for (const item of SERVICE_SEED) {
    const owner = item.owner ? teamBySlug.get(item.owner) : undefined;
    const [service] = await db
      .insert(services)
      .values({
        organizationId: org.id,
        key: item.key,
        name: item.name,
        description: item.description,
        lifecycle: item.lifecycle,
        tier: item.tier,
        ownerTeamId: owner?.id ?? null,
        docsUrl: item.docsUrl,
        source: "seed",
      })
      .returning();

    if (item.repo) {
      await db.insert(repositories).values({
        organizationId: org.id,
        serviceId: service.id,
        githubId: item.repo.githubId,
        name: item.key,
        fullName: `keel/${item.key}`,
        url: `https://github.com/keel/${item.key}`,
        defaultBranch: "main",
        language: item.repo.language,
        visibility: item.repo.visibility,
        topics: item.repo.topics,
        hasReadme: item.repo.hasReadme,
        hasCi: item.repo.hasCi,
        branchProtection: item.repo.branchProtection,
        lastPushedAt:
          item.repo.pushedDaysAgo == null ? null : daysAgo(item.repo.pushedDaysAgo),
        syncedAt: new Date(),
      });
    }
  }

  await db.insert(apiTokens).values({
    organizationId: org.id,
    name: "Demo",
    tokenHash: hashToken(DEMO_API_TOKEN),
    prefix: DEMO_API_TOKEN.slice(0, 16),
  });

  await evaluateOrganization(db, org.id);
}

export async function rotateDemoToken(db: Database, organizationId: string) {
  const token = `dash_live_${nanoid(28)}`;
  await db.insert(apiTokens).values({
    organizationId,
    name: "CLI",
    tokenHash: hashToken(token),
    prefix: token.slice(0, 16),
  });
  return token;
}

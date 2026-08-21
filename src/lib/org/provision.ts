import { eq } from "drizzle-orm";
import type { Database } from "@/db/client";
import {
  githubConnections,
  memberships,
  organizations,
  scorecardRules,
  scorecards,
  users,
} from "@/db/schema";
import { encryptSecret } from "@/lib/crypto";
import { PRODUCTION_READINESS_RULES, PRODUCTION_READINESS_SLUG } from "@/lib/scorecards/production-readiness";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export async function ensureProductionScorecard(db: Database, organizationId: string) {
  const [existing] = await db
    .select()
    .from(scorecards)
    .where(eq(scorecards.organizationId, organizationId));
  if (existing) return existing;

  const [scorecard] = await db
    .insert(scorecards)
    .values({
      organizationId,
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

  return scorecard;
}

export async function upsertGithubUser(
  db: Database,
  profile: {
    id: number;
    login: string;
    name: string | null;
    email: string | null;
    avatar_url: string;
  },
  accessToken: string,
  scope: string,
) {
  const githubId = String(profile.id);
  const existing = await db.select().from(users).where(eq(users.githubId, githubId));

  let user = existing[0];
  if (user) {
    const [updated] = await db
      .update(users)
      .set({
        login: profile.login,
        name: profile.name,
        email: profile.email,
        avatarUrl: profile.avatar_url,
      })
      .where(eq(users.id, user.id))
      .returning();
    user = updated;
  } else {
    const [created] = await db
      .insert(users)
      .values({
        githubId,
        login: profile.login,
        name: profile.name,
        email: profile.email,
        avatarUrl: profile.avatar_url,
      })
      .returning();
    user = created;
  }

  const membership = await db
    .select()
    .from(memberships)
    .where(eq(memberships.userId, user.id));

  let organizationId = membership[0]?.organizationId;
  if (!organizationId) {
    let slug = slugify(profile.login) || `org-${githubId}`;
    const clash = await db.select().from(organizations).where(eq(organizations.slug, slug));
    if (clash[0]) slug = `${slug}-${githubId}`;
    const [org] = await db
      .insert(organizations)
      .values({ name: profile.login, slug })
      .returning();
    organizationId = org.id;
    await db.insert(memberships).values({
      organizationId,
      userId: user.id,
      role: "owner",
    });
    await ensureProductionScorecard(db, organizationId);
  }

  await db
    .insert(githubConnections)
    .values({
      organizationId,
      githubLogin: profile.login,
      githubUserId: githubId,
      accessTokenEncrypted: encryptSecret(accessToken),
      scope,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: githubConnections.organizationId,
      set: {
        githubLogin: profile.login,
        githubUserId: githubId,
        accessTokenEncrypted: encryptSecret(accessToken),
        scope,
        updatedAt: new Date(),
      },
    });

  return { user, organizationId };
}

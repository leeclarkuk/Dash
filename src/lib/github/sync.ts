import { and, eq } from "drizzle-orm";
import { Octokit } from "octokit";
import type { Database } from "@/db/client";
import { githubConnections, repositories, services } from "@/db/schema";
import { decryptSecret } from "@/lib/crypto";
import { evaluateOrganization } from "@/lib/catalog/evaluate";
import { inspectRepository, mapPool } from "./inspect";
import { mapGitHubRepo, type GitHubRepoInput } from "./map-repo";

export type SyncSummary = {
  seen: number;
  imported: number;
  updated: number;
  skipped: number;
  errors: string[];
};

export async function getGithubConnection(db: Database, organizationId: string) {
  const [row] = await db
    .select()
    .from(githubConnections)
    .where(eq(githubConnections.organizationId, organizationId));
  return row ?? null;
}

export async function syncGithubOrganization(
  db: Database,
  organizationId: string,
): Promise<SyncSummary> {
  const connection = await getGithubConnection(db, organizationId);
  if (!connection) {
    throw new Error("GitHub is not connected for this organisation.");
  }

  const token = decryptSecret(connection.accessTokenEncrypted);
  const octokit = new Octokit({
    auth: token,
    userAgent: "Dash-IDP",
  });

  const repos: GitHubRepoInput[] = [];
  for await (const page of octokit.paginate.iterator(
    octokit.rest.repos.listForAuthenticatedUser,
    {
      per_page: 100,
      affiliation: "owner,organization_member",
      sort: "full_name",
    },
  )) {
    for (const repo of page.data) {
      repos.push({
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description,
        html_url: repo.html_url,
        default_branch: repo.default_branch,
        language: repo.language,
        private: repo.private,
        fork: repo.fork,
        archived: repo.archived,
        topics: repo.topics,
        pushed_at: repo.pushed_at,
        visibility: repo.visibility,
      });
    }
    if (repos.length >= 150) break;
  }

  const summary: SyncSummary = {
    seen: repos.length,
    imported: 0,
    updated: 0,
    skipped: 0,
    errors: [],
  };

  const mapped = repos.map(mapGitHubRepo).filter((item) => {
    if (item.skip) {
      summary.skipped += 1;
      return false;
    }
    return true;
  });

  await mapPool(mapped, 4, async (item) => {
    try {
      const [owner, name] = item.fullName.split("/");
      const inspection = await inspectRepository(
        octokit,
        owner,
        name,
        item.defaultBranch,
      );

      const existingRepo = await db
        .select()
        .from(repositories)
        .where(
          and(
            eq(repositories.organizationId, organizationId),
            eq(repositories.githubId, String(item.githubId)),
          ),
        );

      let serviceId: string;
      if (existingRepo[0]) {
        serviceId = existingRepo[0].serviceId;
        await db
          .update(services)
          .set({
            name: item.serviceName,
            description: item.description,
            updatedAt: new Date(),
            source: "github",
          })
          .where(eq(services.id, serviceId));
        await db
          .update(repositories)
          .set({
            name: item.name,
            fullName: item.fullName,
            url: item.url,
            defaultBranch: item.defaultBranch,
            language: item.language,
            visibility: item.visibility,
            topics: item.topics,
            hasReadme: inspection.hasReadme,
            hasCi: inspection.hasCi,
            branchProtection: inspection.branchProtection,
            lastPushedAt: item.lastPushedAt ? new Date(item.lastPushedAt) : null,
            syncedAt: new Date(),
          })
          .where(eq(repositories.id, existingRepo[0].id));
        summary.updated += 1;
      } else {
        const existingService = await db
          .select()
          .from(services)
          .where(
            and(
              eq(services.organizationId, organizationId),
              eq(services.key, item.serviceKey),
            ),
          );

        if (existingService[0]) {
          serviceId = existingService[0].id;
          await db
            .update(services)
            .set({
              description: existingService[0].description ?? item.description,
              source: "github",
              updatedAt: new Date(),
            })
            .where(eq(services.id, serviceId));
        } else {
          const [created] = await db
            .insert(services)
            .values({
              organizationId,
              key: item.serviceKey,
              name: item.serviceName,
              description: item.description,
              source: "github",
            })
            .returning();
          serviceId = created.id;
        }

        await db.insert(repositories).values({
          organizationId,
          serviceId,
          githubId: String(item.githubId),
          name: item.name,
          fullName: item.fullName,
          url: item.url,
          defaultBranch: item.defaultBranch,
          language: item.language,
          visibility: item.visibility,
          topics: item.topics,
          hasReadme: inspection.hasReadme,
          hasCi: inspection.hasCi,
          branchProtection: inspection.branchProtection,
          lastPushedAt: item.lastPushedAt ? new Date(item.lastPushedAt) : null,
          syncedAt: new Date(),
        });
        summary.imported += 1;
      }
    } catch (error) {
      summary.errors.push(
        `${item.fullName}: ${error instanceof Error ? error.message : "unknown error"}`,
      );
    }
  });

  await evaluateOrganization(db, organizationId);
  return summary;
}

import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db/client";
import { services, teams } from "@/db/schema";
import { jsonError, HttpError, resolveAuth } from "@/lib/api/auth";
import { evaluateService } from "@/lib/catalog/evaluate";
import { getService, serializeCatalogItem, toSnapshot } from "@/lib/catalog/queries";
import { repositories } from "@/db/schema";

const PatchBody = z.object({
  ownerTeamSlug: z.string().nullable().optional(),
  docsUrl: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  lifecycle: z.enum(["experimental", "production", "deprecated"]).optional(),
  tier: z.enum(["critical", "standard", "internal"]).optional(),
});

export async function GET(
  request: Request,
  context: { params: Promise<{ key: string }> },
) {
  try {
    const { key } = await context.params;
    const db = await getDb();
    const session = await resolveAuth(db, request);
    const service = await getService(db, session.organizationId, key);
    if (!service) throw new HttpError(404, "Service not found.");
    return Response.json({ service: serializeCatalogItem(service) });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ key: string }> },
) {
  try {
    const { key } = await context.params;
    const db = await getDb();
    const session = await resolveAuth(db, request);
    const parsed = PatchBody.safeParse(await request.json());
    if (!parsed.success) {
      throw new HttpError(400, "Invalid service update.");
    }

    const current = await getService(db, session.organizationId, key);
    if (!current) throw new HttpError(404, "Service not found.");

    let ownerTeamId: string | null | undefined = undefined;
    if (parsed.data.ownerTeamSlug === null) {
      ownerTeamId = null;
    } else if (parsed.data.ownerTeamSlug) {
      const [team] = await db
        .select()
        .from(teams)
        .where(
          and(
            eq(teams.organizationId, session.organizationId),
            eq(teams.slug, parsed.data.ownerTeamSlug),
          ),
        );
      if (!team) throw new HttpError(400, "Unknown team.");
      ownerTeamId = team.id;
    }

    await db
      .update(services)
      .set({
        ...(ownerTeamId !== undefined ? { ownerTeamId } : {}),
        ...(parsed.data.docsUrl !== undefined ? { docsUrl: parsed.data.docsUrl } : {}),
        ...(parsed.data.description !== undefined
          ? { description: parsed.data.description }
          : {}),
        ...(parsed.data.lifecycle ? { lifecycle: parsed.data.lifecycle } : {}),
        ...(parsed.data.tier ? { tier: parsed.data.tier } : {}),
        updatedAt: new Date(),
      })
      .where(eq(services.id, current.id));

    const updated = await getService(db, session.organizationId, key);
    if (!updated) throw new HttpError(404, "Service not found.");

    const [repo] = await db
      .select()
      .from(repositories)
      .where(eq(repositories.serviceId, updated.id));
    const [owner] = updated.owner
      ? await db.select().from(teams).where(eq(teams.id, updated.owner.id))
      : [null];
    const [serviceRow] = await db.select().from(services).where(eq(services.id, updated.id));
    await evaluateService(
      db,
      session.organizationId,
      updated.id,
      toSnapshot(serviceRow, owner, repo ?? null),
    );

    const scored = await getService(db, session.organizationId, key);
    return Response.json({ service: serializeCatalogItem(scored!) });
  } catch (error) {
    return jsonError(error);
  }
}

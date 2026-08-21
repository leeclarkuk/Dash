import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db/client";
import { teams } from "@/db/schema";
import { jsonError, HttpError, resolveAuth } from "@/lib/api/auth";
import { getTeams } from "@/lib/catalog/queries";

const CreateTeam = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(48)
    .regex(/^[a-z0-9-]+$/),
  description: z.string().trim().max(240).optional(),
});

export async function GET(request: Request) {
  try {
    const db = await getDb();
    const session = await resolveAuth(db, request);
    const list = await getTeams(db, session.organizationId);
    return Response.json({
      teams: list.map((team) => ({
        slug: team.slug,
        name: team.name,
        description: team.description,
        services: team.services.map((service) => ({
          key: service.key,
          name: service.name,
          score: service.score
            ? {
                level: service.score.level,
                passed: service.score.passed,
                total: service.score.total,
              }
            : null,
        })),
      })),
    });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const db = await getDb();
    const session = await resolveAuth(db, request);
    const parsed = CreateTeam.safeParse(await request.json());
    if (!parsed.success) throw new HttpError(400, "Invalid team.");
    const clash = await db
      .select()
      .from(teams)
      .where(eq(teams.slug, parsed.data.slug));
    if (clash.some((row) => row.organizationId === session.organizationId)) {
      throw new HttpError(409, "A team with that slug already exists.");
    }
    const [created] = await db
      .insert(teams)
      .values({
        organizationId: session.organizationId,
        name: parsed.data.name,
        slug: parsed.data.slug,
        description: parsed.data.description ?? null,
      })
      .returning();
    return Response.json({
      team: {
        slug: created.slug,
        name: created.name,
        description: created.description,
      },
    });
  } catch (error) {
    return jsonError(error);
  }
}

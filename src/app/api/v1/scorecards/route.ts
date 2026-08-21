import { getDb } from "@/db/client";
import { jsonError, HttpError, resolveAuth } from "@/lib/api/auth";
import { getScorecard } from "@/lib/catalog/queries";

export async function GET(request: Request) {
  try {
    const db = await getDb();
    const session = await resolveAuth(db, request);
    const scorecard = await getScorecard(db, session.organizationId);
    if (!scorecard) throw new HttpError(404, "No scorecard is installed.");
    return Response.json({
      scorecard: {
        slug: scorecard.slug,
        name: scorecard.name,
        description: scorecard.description,
        summary: scorecard.summary,
        rules: scorecard.rules.map((rule) => ({
          key: rule.key,
          title: rule.title,
          description: rule.description,
          level: rule.level,
          required: rule.required,
        })),
      },
    });
  } catch (error) {
    return jsonError(error);
  }
}

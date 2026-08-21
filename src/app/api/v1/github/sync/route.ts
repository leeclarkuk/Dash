import { getDb } from "@/db/client";
import { jsonError, HttpError, resolveAuth } from "@/lib/api/auth";
import { getGithubConnection, syncGithubOrganization } from "@/lib/github/sync";

export async function GET(request: Request) {
  try {
    const db = await getDb();
    const session = await resolveAuth(db, request);
    const connection = await getGithubConnection(db, session.organizationId);
    return Response.json({
      connected: Boolean(connection),
      githubLogin: connection?.githubLogin ?? null,
      updatedAt: connection?.updatedAt?.toISOString() ?? null,
    });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const db = await getDb();
    const session = await resolveAuth(db, request);
    if (session.userId === "api") {
      throw new HttpError(403, "GitHub sync must be run by a signed-in user.");
    }
    const summary = await syncGithubOrganization(db, session.organizationId);
    return Response.json({ summary });
  } catch (error) {
    return jsonError(error);
  }
}

import { eq } from "drizzle-orm";
import type { Database } from "@/db/client";
import { apiTokens } from "@/db/schema";
import { hashToken } from "@/lib/crypto";
import { getSession, type Session } from "@/lib/auth/session";

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export async function resolveAuth(
  db: Database,
  request: Request,
): Promise<Session> {
  const header = request.headers.get("authorization");
  if (header?.toLowerCase().startsWith("bearer ")) {
    const token = header.slice(7).trim();
    if (!token) throw new HttpError(401, "Empty bearer token.");
    const [row] = await db
      .select()
      .from(apiTokens)
      .where(eq(apiTokens.tokenHash, hashToken(token)));
    if (!row) throw new HttpError(401, "Unknown API token.");
    await db
      .update(apiTokens)
      .set({ lastUsedAt: new Date() })
      .where(eq(apiTokens.id, row.id));
    return {
      userId: "api",
      organizationId: row.organizationId,
      login: "api",
      name: row.name,
    };
  }

  const session = await getSession();
  if (!session) throw new HttpError(401, "Authentication required.");
  return session;
}

export async function jsonError(error: unknown) {
  if (error instanceof HttpError) {
    return Response.json({ error: error.message }, { status: error.status });
  }
  const message = error instanceof Error ? error.message : "Unexpected error.";
  return Response.json({ error: message }, { status: 500 });
}

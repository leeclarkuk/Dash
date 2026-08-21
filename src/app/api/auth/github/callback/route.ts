import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getDb } from "@/db/client";
import { env } from "@/lib/env";
import { exchangeGithubCode, fetchGithubUser, GITHUB_OAUTH_STATE_COOKIE } from "@/lib/auth/github";
import { setSessionCookie } from "@/lib/auth/session";
import { upsertGithubUser } from "@/lib/org/provision";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const jar = await cookies();
  const expected = jar.get(GITHUB_OAUTH_STATE_COOKIE)?.value;
  jar.delete(GITHUB_OAUTH_STATE_COOKIE);

  if (!code || !state || !expected || state !== expected) {
    return NextResponse.redirect(new URL("/login?error=oauth_state", env().appUrl));
  }

  try {
    const { accessToken, scope } = await exchangeGithubCode(code);
    const profile = await fetchGithubUser(accessToken);
    const db = await getDb();
    const { user, organizationId } = await upsertGithubUser(db, profile, accessToken, scope);
    await setSessionCookie({
      userId: user.id,
      organizationId,
      login: user.login,
      name: user.name,
    });
    return NextResponse.redirect(new URL("/catalog", env().appUrl));
  } catch {
    return NextResponse.redirect(new URL("/login?error=oauth_failed", env().appUrl));
  }
}

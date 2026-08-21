import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { githubAuthorizeUrl, GITHUB_OAUTH_STATE_COOKIE } from "@/lib/auth/github";

export async function GET() {
  if (!env().githubConfigured) {
    return NextResponse.json(
      { error: "GitHub OAuth is not configured. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET." },
      { status: 400 },
    );
  }
  const state = randomBytes(16).toString("hex");
  const jar = await cookies();
  jar.set(GITHUB_OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });
  return NextResponse.redirect(githubAuthorizeUrl(state));
}

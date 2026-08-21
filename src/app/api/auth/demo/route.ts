import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { memberships, organizations, users } from "@/db/schema";
import { DEMO_ORG_SLUG, DEMO_USER_LOGIN } from "@/db/seed";
import { env } from "@/lib/env";
import { setSessionCookie } from "@/lib/auth/session";

export async function POST() {
  if (!env().allowDemoAuth) {
    return NextResponse.json({ error: "Demo sign-in is disabled." }, { status: 403 });
  }

  const db = await getDb();
  const [user] = await db.select().from(users).where(eq(users.login, DEMO_USER_LOGIN));
  const [org] = await db.select().from(organizations).where(eq(organizations.slug, DEMO_ORG_SLUG));
  if (!user || !org) {
    return NextResponse.json({ error: "Demo organisation is not seeded." }, { status: 500 });
  }

  const [membership] = await db
    .select()
    .from(memberships)
    .where(eq(memberships.userId, user.id));
  if (!membership) {
    return NextResponse.json({ error: "Demo membership missing." }, { status: 500 });
  }

  await setSessionCookie({
    userId: user.id,
    organizationId: org.id,
    login: user.login,
    name: user.name,
  });

  return NextResponse.json({ ok: true, redirect: "/catalog" });
}

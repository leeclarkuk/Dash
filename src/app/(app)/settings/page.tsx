import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { GithubSyncButton } from "@/components/settings/github-sync-button";
import { getDb } from "@/db/client";
import { DEMO_API_TOKEN } from "@/db/seed";
import { env } from "@/lib/env";
import { getSession } from "@/lib/auth/session";
import { getGithubConnection } from "@/lib/github/sync";
import { organizations } from "@/db/schema";
import { eq } from "drizzle-orm";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const db = await getDb();
  const [org] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, session.organizationId));
  const connection = await getGithubConnection(db, session.organizationId);
  const demo = env().allowDemoAuth && session.login === "demo";

  return (
    <main className="px-6 py-6">
      <header className="mb-6">
        <h1 className="text-[22px] font-normal tracking-[-0.015em]">Settings</h1>
        <p className="mt-1 text-[13px] text-body">
          Organisation, GitHub, and the API. Keep secrets out of git.
        </p>
      </header>
      <div className="grid max-w-2xl gap-4">
        <section className="rounded-xl border border-hairline bg-surface p-4">
          <h2 className="text-[13px] font-semibold">Organisation</h2>
          <dl className="mt-3 grid gap-2 text-[13px]">
            <div className="flex justify-between">
              <dt className="text-muted">Name</dt>
              <dd>{org?.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Slug</dt>
              <dd className="font-mono text-[12.5px]">{org?.slug}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Signed in as</dt>
              <dd className="font-mono text-[12.5px]">{session.login}</dd>
            </div>
          </dl>
        </section>
        <section className="rounded-xl border border-hairline bg-surface p-4">
          <h2 className="text-[13px] font-semibold">GitHub</h2>
          <p className="mt-2 text-[13px] text-body">
            {connection
              ? `Connected as ${connection.githubLogin}. Sync reads repositories you can access, skips forks and archives, and re-evaluates scorecards.`
              : "Not connected. Sign in with GitHub on a configured instance."}
          </p>
          <div className="mt-4">
            <GithubSyncButton connected={Boolean(connection)} />
          </div>
        </section>
        <section className="rounded-xl border border-hairline bg-surface p-4">
          <h2 className="text-[13px] font-semibold">API</h2>
          <p className="mt-2 text-[13px] text-body">
            Session cookies work from the UI. For automation, send{" "}
            <code className="font-mono text-[12px]">Authorization: Bearer &lt;token&gt;</code>.
          </p>
          {demo ? (
            <p className="mt-3 rounded-lg bg-canvas-soft px-3 py-2 font-mono text-[12px]">
              {DEMO_API_TOKEN}
            </p>
          ) : (
            <p className="mt-3 text-[13px] text-body">
              Token minting in the UI is not in v1. Hash a token into{" "}
              <code className="font-mono text-[12px]">api_tokens</code> or use the demo token
              only on local demo organisations.
            </p>
          )}
          <p className="mt-3 font-mono text-[12px] text-muted">
            GET /api/v1/services
            <br />
            GET /api/v1/services/:key
            <br />
            GET /api/v1/teams
            <br />
            GET /api/v1/scorecards
            <br />
            POST /api/v1/github/sync
          </p>
        </section>
      </div>
    </main>
  );
}

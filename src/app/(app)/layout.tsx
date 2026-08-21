import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/shell/app-shell";
import { getDb } from "@/db/client";
import { getSession } from "@/lib/auth/session";
import { getCatalog, getTeams } from "@/lib/catalog/queries";

export const dynamic = "force-dynamic";

export default async function ProductLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  const db = await getDb();
  const [catalog, teams] = await Promise.all([
    getCatalog(db, session.organizationId),
    getTeams(db, session.organizationId),
  ]);

  return (
    <AppShell
      login={session.login}
      services={catalog.map((item) => ({
        href: `/catalog/${item.key}`,
        label: item.key,
        hint: item.owner?.name,
      }))}
      teams={teams.map((team) => ({
        href: `/teams/${team.slug}`,
        label: team.name,
      }))}
    >
      {children}
    </AppShell>
  );
}

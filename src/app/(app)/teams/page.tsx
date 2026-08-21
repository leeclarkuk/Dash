import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CreateTeamForm } from "@/components/teams/create-team-form";
import { LevelPill } from "@/components/ui/badge";
import { getDb } from "@/db/client";
import { getSession } from "@/lib/auth/session";
import { getTeams } from "@/lib/catalog/queries";

export const metadata: Metadata = { title: "Teams" };

export default async function TeamsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const db = await getDb();
  const teams = await getTeams(db, session.organizationId);

  return (
    <main className="px-6 py-6">
      <header className="mb-6">
        <h1 className="text-[22px] font-normal tracking-[-0.015em]">Teams</h1>
        <p className="mt-1 text-[13px] text-body">
          Ownership is a team, not a Slack mention. Unowned services cannot pass bronze.
        </p>
      </header>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="overflow-hidden rounded-xl border border-hairline bg-surface">
          <table className="w-full text-left text-[13px]">
            <thead className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">
              <tr className="border-b border-hairline">
                <th className="px-4 py-2.5 font-semibold">Team</th>
                <th className="px-4 py-2.5 font-semibold">Services</th>
                <th className="px-4 py-2.5 font-semibold">Gold</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team) => (
                <tr key={team.id} className="border-b border-hairline last:border-0 hover:bg-canvas-soft">
                  <td className="px-4 py-2.5">
                    <Link href={`/teams/${team.slug}`} className="grid">
                      <span className="font-medium">{team.name}</span>
                      <span className="text-[12px] text-muted">{team.description}</span>
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-[12px]">{team.services.length}</td>
                  <td className="px-4 py-2.5">
                    <LevelPill
                      level={
                        team.services.length > 0 &&
                        team.services.every((item) => item.score?.level === "gold")
                          ? "gold"
                          : team.services.some((item) => item.score?.level === "gold")
                            ? "silver"
                            : "none"
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <CreateTeamForm />
      </div>
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LevelPill } from "@/components/ui/badge";
import { getDb } from "@/db/client";
import { getSession } from "@/lib/auth/session";
import { getScorecard } from "@/lib/catalog/queries";

export const metadata: Metadata = { title: "Scorecards" };

export default async function ScorecardsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const db = await getDb();
  const scorecard = await getScorecard(db, session.organizationId);
  if (!scorecard) {
    return (
      <main className="px-6 py-6">
        <h1 className="text-[22px] font-normal">Scorecards</h1>
        <p className="mt-2 text-body">No scorecard is installed for this organisation.</p>
      </main>
    );
  }

  return (
    <main className="px-6 py-6">
      <header className="mb-6">
        <h1 className="text-[22px] font-normal tracking-[-0.015em]">{scorecard.name}</h1>
        <p className="mt-1 max-w-2xl text-[13px] text-body">{scorecard.description}</p>
      </header>
      <div className="mb-6 flex flex-wrap gap-3 text-[13px]">
        {(["gold", "silver", "bronze", "none"] as const).map((level) => (
          <div key={level} className="rounded-lg border border-hairline bg-surface px-3 py-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">
              {level === "none" ? "Unscored" : level}
            </p>
            <p className="font-mono text-[16px]">{scorecard.summary[level]}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-hairline bg-surface">
          <h2 className="border-b border-hairline px-4 py-3 text-[13px] font-semibold">Rules</h2>
          <ul className="divide-y divide-hairline">
            {scorecard.rules.map((rule) => (
              <li key={rule.key} className="px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[13px] font-medium">{rule.title}</p>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">
                    {rule.level}
                    {rule.required ? "" : " · optional"}
                  </span>
                </div>
                <p className="mt-1 text-[12px] text-body">{rule.description}</p>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-xl border border-hairline bg-surface">
          <h2 className="border-b border-hairline px-4 py-3 text-[13px] font-semibold">
            Services
          </h2>
          <ul className="divide-y divide-hairline">
            {scorecard.services.map((service) => (
              <li key={service.id}>
                <Link
                  href={`/catalog/${service.key}`}
                  className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-canvas-soft"
                >
                  <span className="font-mono text-[12.5px]">{service.key}</span>
                  <span className="inline-flex items-center gap-2">
                    <LevelPill level={service.score?.level} />
                    <span className="font-mono text-[12px] text-muted">
                      {service.score ? `${service.score.passed}/${service.score.total}` : "-"}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}

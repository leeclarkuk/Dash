import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-chrome";
import { ButtonLink } from "@/components/ui/button";
import { LevelPill } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Dash: the catalogue that already knows what a service is",
};

const preview = [
  { key: "payments-api", owner: "payments", level: "gold" as const, passed: 7, total: 7 },
  { key: "identity-service", owner: "identity", level: "silver" as const, passed: 6, total: 7 },
  { key: "notifications", owner: "checkout", level: "bronze" as const, passed: 4, total: 7 },
  { key: "ml-fraud", owner: "none", level: "none" as const, passed: 1, total: 7 },
];

export default async function HomePage() {
  const session = await getSession();

  return (
    <div className="min-h-full">
      <SiteHeader signedIn={Boolean(session)} />
      <main>
        <section className="mx-auto max-w-5xl px-6 py-20">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
            Internal developer platform
          </p>
          <h1 className="mt-4 max-w-3xl text-[36px] font-normal leading-[1.2] tracking-[-0.02em]">
            Port makes you invent a data model. Dash ships with one.
          </h1>
          <p className="mt-5 max-w-2xl text-[16px] leading-7 text-body">
            A software catalogue for teams who already know what a service is.
            Ownership, GitHub, and production-readiness scorecards. Self-host it.
            Put it in production when the catalogue is true, not when the
            blueprint workshop ends.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href={session ? "/catalog" : "/login"}>
              {session ? "Open catalogue" : "Open the demo"}
            </ButtonLink>
            <ButtonLink href="https://github.com/leeclarkuk/Dash" variant="secondary">
              Source
            </ButtonLink>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 pb-16">
          <div className="overflow-hidden rounded-xl border border-hairline bg-surface">
            <div className="flex items-center justify-between border-b border-hairline px-4 py-3">
              <span className="text-[13px] font-semibold">Catalogue</span>
              <span className="font-mono text-[12px] text-muted">keel / 12 services</span>
            </div>
            <table className="w-full text-left text-[13px]">
              <thead className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">
                <tr className="border-b border-hairline">
                  <th className="px-4 py-2.5 font-semibold">Service</th>
                  <th className="px-4 py-2.5 font-semibold">Owner</th>
                  <th className="px-4 py-2.5 font-semibold">Readiness</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((row) => (
                  <tr key={row.key} className="border-b border-hairline last:border-0">
                    <td className="px-4 py-2.5 font-mono text-[12.5px]">{row.key}</td>
                    <td className="px-4 py-2.5 text-body">{row.owner}</td>
                    <td className="px-4 py-2.5">
                      <span className="inline-flex items-center gap-2">
                        <LevelPill level={row.level} />
                        <span className="font-mono text-[12px] text-muted">
                          {row.passed}/{row.total}
                        </span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="model" className="mx-auto grid max-w-5xl gap-10 px-6 py-12 md:grid-cols-3">
          <article>
            <h2 className="text-[18px] font-semibold">Opinionated on purpose</h2>
            <p className="mt-2 text-body">
              Service, team, environment, repository. Not an infinite blueprint
              editor. Extensibility comes later, after the catalogue answers
              who owns what.
            </p>
          </article>
          <article id="scorecards">
            <h2 className="text-[18px] font-semibold">Scorecards that fail closed</h2>
            <p className="mt-2 text-body">
              Production readiness is a real evaluation: owner, README, CI,
              recent change, branch protection. Gold is earned. Missing owner
              is not bronze.
            </p>
          </article>
          <article>
            <h2 className="text-[18px] font-semibold">GitHub is the source</h2>
            <p className="mt-2 text-body">
              Repos become services. Forks and archives stay out. Sync
              re-evaluates the scorecard. The portal does not pretend to run
              your pipelines.
            </p>
          </article>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-12">
          <h2 className="text-[22px] font-normal tracking-[-0.01em]">Against Port</h2>
          <div className="mt-6 overflow-hidden rounded-xl border border-hairline bg-surface">
            <table className="w-full text-left text-[13px]">
              <thead className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">
                <tr className="border-b border-hairline">
                  <th className="px-4 py-2.5 font-semibold"> </th>
                  <th className="px-4 py-2.5 font-semibold">Port</th>
                  <th className="px-4 py-2.5 font-semibold">Dash</th>
                </tr>
              </thead>
              <tbody className="text-body">
                <tr className="border-b border-hairline">
                  <td className="px-4 py-3 text-ink">Data model</td>
                  <td className="px-4 py-3">You invent blueprints</td>
                  <td className="px-4 py-3">A service is a service</td>
                </tr>
                <tr className="border-b border-hairline">
                  <td className="px-4 py-3 text-ink">Where it runs</td>
                  <td className="px-4 py-3">Their SaaS</td>
                  <td className="px-4 py-3">Your Postgres, or embedded for local</td>
                </tr>
                <tr className="border-b border-hairline">
                  <td className="px-4 py-3 text-ink">Scorecards</td>
                  <td className="px-4 py-3">Configurable theatre, if you wire it</td>
                  <td className="px-4 py-3">Ships with production readiness</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-ink">Self-service actions</td>
                  <td className="px-4 py-3">Forms that fire someone else&apos;s job</td>
                  <td className="px-4 py-3">Not in v1. Catalogue first.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4 max-w-3xl text-body">
            v1 is deliberately smaller than Port. Catalogue, ownership, GitHub
            ingest, scorecards, a public API. If that is not true, a self-service
            button is a lie with a progress spinner.
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ServiceEditor } from "@/components/catalog/service-editor";
import { ScorecardPanel } from "@/components/scorecards/scorecard-panel";
import { Badge } from "@/components/ui/badge";
import { getDb } from "@/db/client";
import { getSession } from "@/lib/auth/session";
import { getService, getTeams } from "@/lib/catalog/queries";
import { formatRelative } from "@/lib/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ key: string }>;
}): Promise<Metadata> {
  const { key } = await params;
  return { title: key };
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  const { key } = await params;
  const db = await getDb();
  const [service, teams] = await Promise.all([
    getService(db, session.organizationId, key),
    getTeams(db, session.organizationId),
  ]);
  if (!service) notFound();

  return (
    <main className="px-6 py-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">
        <Link href="/catalog" className="hover:text-ink">
          Catalogue
        </Link>
        <span className="mx-2">/</span>
        <span className="font-mono normal-case tracking-normal">{service.key}</span>
      </p>
      <header className="mt-3 mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold tracking-[-0.015em]">{service.name}</h1>
          <p className="mt-1 max-w-2xl text-[13px] text-body">
            {service.description ?? "No description yet."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge>{service.lifecycle}</Badge>
          <Badge>{service.tier}</Badge>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
        <div className="grid gap-4">
          <section className="grid gap-3 rounded-xl border border-hairline bg-surface p-4">
            <h2 className="text-[13px] font-semibold">What this is</h2>
            <dl className="grid gap-2 text-[13px]">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Owner</dt>
                <dd>
                  {service.owner ? (
                    <Link href={`/teams/${service.owner.slug}`} className="hover:underline">
                      {service.owner.name}
                    </Link>
                  ) : (
                    <span className="text-danger">Unowned</span>
                  )}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Repository</dt>
                <dd className="font-mono text-[12.5px]">
                  {service.repository ? (
                    <a
                      href={service.repository.url}
                      className="hover:underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {service.repository.fullName}
                    </a>
                  ) : (
                    "None"
                  )}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Language</dt>
                <dd>{service.repository?.language ?? "None"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Docs</dt>
                <dd>
                  {service.docsUrl ? (
                    <a href={service.docsUrl} className="hover:underline" target="_blank" rel="noreferrer">
                      Open
                    </a>
                  ) : (
                    "None"
                  )}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Last push</dt>
                <dd>{formatRelative(service.snapshot.repository?.lastPushedAt)}</dd>
              </div>
            </dl>
          </section>
          <ScorecardPanel
            level={service.score?.level}
            passed={service.score?.passed ?? 0}
            total={service.score?.total ?? 0}
            outcomes={service.score?.outcomes ?? []}
          />
        </div>
        <ServiceEditor
          serviceKey={service.key}
          teams={teams.map((team) => ({ slug: team.slug, name: team.name }))}
          initial={{
            ownerTeamSlug: service.owner?.slug ?? "",
            description: service.description ?? "",
            docsUrl: service.docsUrl ?? "",
            lifecycle: service.lifecycle,
            tier: service.tier,
          }}
        />
      </div>
    </main>
  );
}

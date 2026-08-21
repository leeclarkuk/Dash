import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ServiceTable } from "@/components/catalog/service-table";
import { getDb } from "@/db/client";
import { getSession } from "@/lib/auth/session";
import { getTeam } from "@/lib/catalog/queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return { title: slug };
}

export default async function TeamPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  const { slug } = await params;
  const db = await getDb();
  const team = await getTeam(db, session.organizationId, slug);
  if (!team) notFound();

  return (
    <main className="px-6 py-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">
        <Link href="/teams" className="hover:text-ink">
          Teams
        </Link>
        <span className="mx-2">/</span>
        {team.slug}
      </p>
      <header className="mt-3 mb-6">
        <h1 className="text-[22px] font-semibold tracking-[-0.015em]">{team.name}</h1>
        <p className="mt-1 max-w-2xl text-[13px] text-body">
          {team.description ?? "No description."}
        </p>
      </header>
      <ServiceTable items={team.services} />
    </main>
  );
}

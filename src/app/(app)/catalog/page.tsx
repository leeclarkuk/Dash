import type { Metadata } from "next";
import { ServiceTable } from "@/components/catalog/service-table";
import { getDb } from "@/db/client";
import { getSession } from "@/lib/auth/session";
import { getCatalog } from "@/lib/catalog/queries";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Catalogue" };

export default async function CatalogPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const db = await getDb();
  const catalog = await getCatalog(db, session.organizationId);
  const unowned = catalog.filter((item) => !item.owner).length;
  const failing = catalog.filter((item) => item.score && item.score.failed > 0).length;

  return (
    <main className="px-6 py-6">
      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-normal tracking-[-0.015em]">Catalogue</h1>
          <p className="mt-1 text-[13px] text-body">
            {catalog.length} services
            {unowned ? ` · ${unowned} unowned` : ""}
            {failing ? ` · ${failing} with failing rules` : ""}
          </p>
        </div>
      </header>
      <ServiceTable items={catalog} />
    </main>
  );
}

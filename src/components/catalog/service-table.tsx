import type { CatalogItem } from "@/lib/catalog/queries";
import { LevelPill } from "@/components/ui/badge";
import Link from "next/link";

export function ServiceTable({ items }: { items: CatalogItem[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-hairline bg-surface px-5 py-10 text-center">
        <p className="font-semibold">No services yet</p>
        <p className="mt-2 text-body">
          Connect GitHub in Settings and sync, or wait for the demo seed on a
          fresh database.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-hairline bg-surface">
      <table className="w-full text-left text-[13px]">
        <thead className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">
          <tr className="border-b border-hairline">
            <th className="px-4 py-2.5 font-semibold">Service</th>
            <th className="px-4 py-2.5 font-semibold">Owner</th>
            <th className="px-4 py-2.5 font-semibold">Tier</th>
            <th className="px-4 py-2.5 font-semibold">Repo</th>
            <th className="px-4 py-2.5 font-semibold">Readiness</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-hairline last:border-0 hover:bg-canvas-soft">
              <td className="px-4 py-2.5">
                <Link href={`/catalog/${item.key}`} className="grid">
                  <span className="font-mono text-[12.5px]">{item.key}</span>
                  <span className="text-[12px] text-muted">
                    {item.description ?? "No description"}
                  </span>
                </Link>
              </td>
              <td className="px-4 py-2.5">
                {item.owner ? (
                  <Link href={`/teams/${item.owner.slug}`} className="hover:underline">
                    {item.owner.name}
                  </Link>
                ) : (
                  <span className="text-danger">Unowned</span>
                )}
              </td>
              <td className="px-4 py-2.5 capitalize text-body">{item.tier}</td>
              <td className="px-4 py-2.5 font-mono text-[12px] text-body">
                {item.repository?.fullName ?? "None"}
              </td>
              <td className="px-4 py-2.5">
                <span className="inline-flex items-center gap-2">
                  <LevelPill level={item.score?.level} />
                  <span className="font-mono text-[12px] text-muted">
                    {item.score ? `${item.score.passed}/${item.score.total}` : "-"}
                  </span>
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

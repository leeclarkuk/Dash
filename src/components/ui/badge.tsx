import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { ScoreLevel } from "@/lib/scorecards/types";
import { levelLabel } from "@/lib/format";

export function Badge({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-hairline px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-body",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function LevelPill({ level }: { level: ScoreLevel | null | undefined }) {
  const resolved = level ?? "none";
  const colour =
    resolved === "gold"
      ? "text-success border-success/30"
      : resolved === "silver"
        ? "text-ink border-hairline-strong"
        : resolved === "bronze"
          ? "text-warning border-warning/30"
          : "text-danger border-danger/30";

  return <Badge className={colour}>{levelLabel(resolved)}</Badge>;
}

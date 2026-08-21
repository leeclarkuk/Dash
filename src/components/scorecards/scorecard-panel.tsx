import { LevelPill } from "@/components/ui/badge";
import type { RuleOutcome } from "@/lib/scorecards/types";

export function ScorecardPanel({
  level,
  passed,
  total,
  outcomes,
}: {
  level: RuleOutcome["level"] | "none" | null | undefined;
  passed: number;
  total: number;
  outcomes: RuleOutcome[];
}) {
  const failed = outcomes.filter((item) => !item.passed);

  return (
    <section className="rounded-xl border border-hairline bg-surface">
      <header className="flex items-center justify-between border-b border-hairline px-4 py-3">
        <div>
          <h2 className="text-[13px] font-semibold">Production readiness</h2>
          <p className="text-[12px] text-muted">
            {passed}/{total} rules passed
          </p>
        </div>
        <LevelPill level={level === "bronze" || level === "silver" || level === "gold" ? level : "none"} />
      </header>
      {failed.length > 0 ? (
        <div className="border-b border-hairline px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-danger">
            Failed
          </p>
          <ul className="mt-2 grid gap-2">
            {failed.map((rule) => (
              <li key={rule.key} className="text-[13px]">
                <p className="font-medium">{rule.title}</p>
                <p className="text-[12px] text-body">{rule.message}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <ul className="divide-y divide-hairline">
        {outcomes.map((rule) => (
          <li key={rule.key} className="grid gap-1 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[13px] font-medium">{rule.title}</p>
              <span
                className={
                  rule.passed
                    ? "text-[11px] font-semibold uppercase tracking-[0.06em] text-success"
                    : "text-[11px] font-semibold uppercase tracking-[0.06em] text-danger"
                }
              >
                {rule.passed ? "Pass" : "Fail"}
              </span>
            </div>
            <p className="text-[12px] text-body">{rule.description}</p>
            <p className="font-mono text-[12px] text-muted">{rule.message}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

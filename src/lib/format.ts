export function formatRelative(iso: string | null | undefined, now = new Date()): string {
  if (!iso) return "never";
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return "never";
  const delta = now.getTime() - then.getTime();
  const minutes = Math.round(delta / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 36) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 14) return `${days}d ago`;
  if (days < 60) return `${Math.round(days / 7)}w ago`;
  return then.toISOString().slice(0, 10);
}

export function levelLabel(level: string | null | undefined) {
  if (!level || level === "none") return "Unscored";
  return level.charAt(0).toUpperCase() + level.slice(1);
}

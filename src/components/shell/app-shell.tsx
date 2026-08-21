import type { ReactNode } from "react";
import Link from "next/link";
import { AppNav } from "@/components/shell/app-nav";
import { CommandPalette } from "@/components/shell/command-palette";
import { SignOutButton } from "@/components/shell/sign-out-button";

export function AppShell({
  login,
  services,
  teams,
  children,
}: {
  login: string;
  services: { href: string; label: string; hint?: string }[];
  teams: { href: string; label: string }[];
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-full">
      <aside className="flex w-[220px] shrink-0 flex-col border-r border-hairline bg-canvas">
        <div className="flex h-14 items-center px-4">
          <Link href="/catalog" className="text-[14px] font-semibold">
            Dash
          </Link>
        </div>
        <AppNav />
        <div className="mt-auto border-t border-hairline px-3 py-3">
          <p className="truncate font-mono text-[12px] text-muted">{login}</p>
          <p className="mt-1 text-[11px] text-muted">⌘K to search</p>
          <SignOutButton />
        </div>
      </aside>
      <div className="min-w-0 flex-1 bg-canvas">{children}</div>
      <CommandPalette services={services} teams={teams} />
    </div>
  );
}

"use client";

import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Item = { href: string; label: string; hint?: string };

export function CommandPalette({
  services,
  teams,
}: {
  services: Item[];
  teams: Item[];
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-ink/20 p-4" onClick={() => setOpen(false)}>
      <div
        className="mx-auto mt-[12vh] max-w-lg overflow-hidden rounded-xl border border-hairline bg-surface"
        onClick={(event) => event.stopPropagation()}
      >
        <Command label="Command palette" className="text-[13px]">
          <Command.Input
            autoFocus
            placeholder="Search services, teams, pages"
            className="h-11 w-full border-b border-hairline bg-transparent px-4 outline-none placeholder:text-muted"
          />
          <Command.List className="max-h-80 overflow-auto p-2">
            <Command.Empty className="px-2 py-6 text-center text-muted">
              Nothing matches.
            </Command.Empty>
            <Command.Group heading="Pages" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.06em] [&_[cmdk-group-heading]]:text-muted">
              <Command.Item onSelect={() => go("/catalog")} className="rounded-md px-2 py-2 aria-selected:bg-canvas-soft">
                Catalogue
              </Command.Item>
              <Command.Item onSelect={() => go("/teams")} className="rounded-md px-2 py-2 aria-selected:bg-canvas-soft">
                Teams
              </Command.Item>
              <Command.Item onSelect={() => go("/scorecards")} className="rounded-md px-2 py-2 aria-selected:bg-canvas-soft">
                Scorecards
              </Command.Item>
              <Command.Item onSelect={() => go("/settings")} className="rounded-md px-2 py-2 aria-selected:bg-canvas-soft">
                Settings
              </Command.Item>
            </Command.Group>
            <Command.Group heading="Services" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.06em] [&_[cmdk-group-heading]]:text-muted">
              {services.map((item) => (
                <Command.Item
                  key={item.href}
                  value={`${item.label} ${item.hint ?? ""}`}
                  onSelect={() => go(item.href)}
                  className="flex items-center justify-between rounded-md px-2 py-2 aria-selected:bg-canvas-soft"
                >
                  <span className="font-mono text-[12.5px]">{item.label}</span>
                  {item.hint ? <span className="text-[12px] text-muted">{item.hint}</span> : null}
                </Command.Item>
              ))}
            </Command.Group>
            <Command.Group heading="Teams" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.06em] [&_[cmdk-group-heading]]:text-muted">
              {teams.map((item) => (
                <Command.Item
                  key={item.href}
                  value={item.label}
                  onSelect={() => go(item.href)}
                  className="rounded-md px-2 py-2 aria-selected:bg-canvas-soft"
                >
                  {item.label}
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}

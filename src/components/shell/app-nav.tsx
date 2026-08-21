"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/catalog", label: "Catalogue" },
  { href: "/teams", label: "Teams" },
  { href: "/scorecards", label: "Scorecards" },
  { href: "/settings", label: "Settings" },
];

export function AppNav() {
  const pathname = usePathname();
  return (
    <nav className="grid gap-0.5 px-2">
      {NAV.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-md px-2 py-1.5 text-[13px]",
              active ? "bg-surface text-ink" : "text-body hover:text-ink",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

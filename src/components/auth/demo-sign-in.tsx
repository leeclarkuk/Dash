"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function DemoSignIn() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onClick() {
    setPending(true);
    setError(null);
    const response = await fetch("/api/auth/demo", { method: "POST" });
    const body = (await response.json()) as { error?: string; redirect?: string };
    if (!response.ok) {
      setError(body.error ?? "Demo sign-in failed.");
      setPending(false);
      return;
    }
    router.push(body.redirect ?? "/catalog");
    router.refresh();
  }

  return (
    <div className="grid gap-2">
      <Button type="button" variant="secondary" onClick={onClick} disabled={pending}>
        {pending ? "Opening Keel…" : "Open the Keel demo"}
      </Button>
      {error ? <p className="text-[12px] text-danger">{error}</p> : null}
    </div>
  );
}

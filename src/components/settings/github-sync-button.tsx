"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function GithubSyncButton({ connected }: { connected: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setPending(true);
    setError(null);
    setMessage(null);
    const response = await fetch("/api/v1/github/sync", { method: "POST" });
    const body = (await response.json()) as {
      error?: string;
      summary?: { imported: number; updated: number; skipped: number; errors: string[] };
    };
    setPending(false);
    if (!response.ok) {
      setError(body.error ?? "Sync failed.");
      return;
    }
    const summary = body.summary;
    setMessage(
      summary
        ? `Imported ${summary.imported}, updated ${summary.updated}, skipped ${summary.skipped}.`
        : "Sync complete.",
    );
    router.refresh();
  }

  return (
    <div className="grid gap-2">
      <Button type="button" onClick={onClick} disabled={pending || !connected} size="sm">
        {pending ? "Syncing…" : "Sync repositories"}
      </Button>
      {!connected ? (
        <p className="text-[12px] text-body">
          Sign in with GitHub to connect a token. Demo mode has no live GitHub access.
        </p>
      ) : null}
      {message ? <p className="text-[12px] text-success">{message}</p> : null}
      {error ? <p className="text-[12px] text-danger">{error}</p> : null}
    </div>
  );
}

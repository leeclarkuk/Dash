"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";

export function CreateTeamForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const response = await fetch("/api/v1/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug, description: description || undefined }),
    });
    const body = (await response.json()) as { error?: string; team?: { slug: string } };
    setPending(false);
    if (!response.ok) {
      setError(body.error ?? "Could not create team.");
      return;
    }
    setName("");
    setSlug("");
    setDescription("");
    router.push(`/teams/${body.team?.slug}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-xl border border-hairline bg-surface p-4">
      <h2 className="text-[13px] font-semibold">New team</h2>
      <Field label="Name">
        <Input value={name} onChange={(event) => setName(event.target.value)} required />
      </Field>
      <Field label="Slug">
        <Input
          value={slug}
          onChange={(event) => setSlug(event.target.value.toLowerCase())}
          pattern="[a-z0-9-]+"
          required
        />
      </Field>
      <Field label="Description">
        <Input value={description} onChange={(event) => setDescription(event.target.value)} />
      </Field>
      {error ? <p className="text-[12px] text-danger">{error}</p> : null}
      <div>
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Creating…" : "Create team"}
        </Button>
      </div>
    </form>
  );
}

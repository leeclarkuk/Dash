"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";

export function ServiceEditor({
  serviceKey,
  teams,
  initial,
}: {
  serviceKey: string;
  teams: { slug: string; name: string }[];
  initial: {
    ownerTeamSlug: string;
    description: string;
    docsUrl: string;
    lifecycle: string;
    tier: string;
  };
}) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const response = await fetch(`/api/v1/services/${serviceKey}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ownerTeamSlug: form.ownerTeamSlug || null,
        description: form.description || null,
        docsUrl: form.docsUrl || null,
        lifecycle: form.lifecycle,
        tier: form.tier,
      }),
    });
    const body = (await response.json()) as { error?: string };
    setPending(false);
    if (!response.ok) {
      setError(body.error ?? "Update failed.");
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-xl border border-hairline bg-surface p-4">
      <h2 className="text-[13px] font-semibold">Ownership and metadata</h2>
      <Field label="Owning team">
        <Select
          value={form.ownerTeamSlug}
          onChange={(event) => setForm({ ...form, ownerTeamSlug: event.target.value })}
        >
          <option value="">Unowned</option>
          {teams.map((team) => (
            <option key={team.slug} value={team.slug}>
              {team.name}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Description">
        <Input
          value={form.description}
          onChange={(event) => setForm({ ...form, description: event.target.value })}
        />
      </Field>
      <Field label="Docs URL">
        <Input
          value={form.docsUrl}
          onChange={(event) => setForm({ ...form, docsUrl: event.target.value })}
          placeholder="https://"
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Lifecycle">
          <Select
            value={form.lifecycle}
            onChange={(event) => setForm({ ...form, lifecycle: event.target.value })}
          >
            <option value="experimental">Experimental</option>
            <option value="production">Production</option>
            <option value="deprecated">Deprecated</option>
          </Select>
        </Field>
        <Field label="Tier">
          <Select
            value={form.tier}
            onChange={(event) => setForm({ ...form, tier: event.target.value })}
          >
            <option value="critical">Critical</option>
            <option value="standard">Standard</option>
            <option value="internal">Internal</option>
          </Select>
        </Field>
      </div>
      {error ? <p className="text-[12px] text-danger">{error}</p> : null}
      <div>
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Saving…" : "Save"}
        </Button>
      </div>
    </form>
  );
}

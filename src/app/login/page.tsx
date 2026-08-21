import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { DemoSignIn } from "@/components/auth/demo-sign-in";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-chrome";
import { ButtonLink } from "@/components/ui/button";
import { getSession } from "@/lib/auth/session";
import { env } from "@/lib/env";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getSession();
  if (session) redirect("/catalog");
  const { error } = await searchParams;
  const github = env().githubConfigured;
  const demo = env().allowDemoAuth;

  const errorText =
    error === "oauth_state"
      ? "GitHub sign-in was rejected. Try again."
      : error === "oauth_failed"
        ? "GitHub sign-in failed. Check the OAuth app configuration."
        : null;

  return (
    <div className="min-h-full">
      <SiteHeader signedIn={false} />
      <main className="mx-auto grid max-w-md gap-6 px-6 py-20">
        <div>
          <h1 className="text-[26px] font-normal tracking-[-0.02em]">Sign in</h1>
          <p className="mt-2 text-body">
            GitHub for a real organisation. The Keel demo if you just want to
            see the catalogue.
          </p>
        </div>
        {errorText ? (
          <p className="rounded-lg border border-danger/30 bg-surface px-3 py-2 text-[13px] text-danger">
            {errorText}
          </p>
        ) : null}
        <div className="grid gap-3 rounded-xl border border-hairline bg-surface p-5">
          {github ? (
            <ButtonLink href="/api/auth/github">Continue with GitHub</ButtonLink>
          ) : (
            <p className="text-[13px] text-body">
              GitHub OAuth is not configured on this instance. Set{" "}
              <code className="font-mono text-[12px]">GITHUB_CLIENT_ID</code> and{" "}
              <code className="font-mono text-[12px]">GITHUB_CLIENT_SECRET</code>{" "}
              to enable it.
            </p>
          )}
          {demo ? <DemoSignIn /> : null}
        </div>
        <p className="text-[12px] text-muted">
          By signing in you get a catalogue for one organisation. Dash does not
          create resources in GitHub beyond reading repositories you can already
          see. <Link href="/" className="text-ink underline-offset-2 hover:underline">Back</Link>
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}

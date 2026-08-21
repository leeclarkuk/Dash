import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";

export function SiteHeader({ signedIn }: { signedIn: boolean }) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-hairline px-6">
      <Link href="/" className="text-[14px] font-semibold tracking-tight">
        Dash
      </Link>
      <nav className="flex items-center gap-5 text-[13px] text-body">
        <Link href="/#model" className="hover:text-ink">
          Model
        </Link>
        <Link href="/#scorecards" className="hover:text-ink">
          Scorecards
        </Link>
        <Link href="https://github.com/leeclarkuk/Dash" className="hover:text-ink">
          GitHub
        </Link>
        {signedIn ? (
          <ButtonLink href="/catalog" size="sm">
            Open catalogue
          </ButtonLink>
        ) : (
          <ButtonLink href="/login" size="sm">
            Sign in
          </ButtonLink>
        )}
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-hairline px-6 py-10 text-[13px] text-body">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p>Dash. An opinionated software catalogue. Apache 2.0.</p>
        <p>Self-host it. Do not rent a portal to learn the names of your own services.</p>
      </div>
    </footer>
  );
}

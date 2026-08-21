# Dash

Port makes you invent a data model. Dash ships with one.

Dash is a self-hosted software catalogue: services, owning teams, GitHub repositories, and a production-readiness scorecard that actually fails. It is an internal developer platform you can put in production without a six-month blueprint workshop.

v1 is deliberately smaller than Port. Catalogue, ownership, GitHub ingest, scorecards, a public API. Self-service buttons come after the catalogue is true.

## What you get

- An opinionated core: organisation, team, service, repository. Not infinite blueprints.
- GitHub OAuth. Repos become services. Forks and archives are skipped.
- A production-readiness scorecard: owner, description, README, CI, recent push, branch protection, docs URL.
- Levels that fail closed. Missing owner is not bronze, even if everything else is green.
- A REST API with session cookies or a bearer token.
- A dense UI: cream canvas, hairline chrome, one accent, keyboard search (⌘K).
- Embedded Postgres (PGlite) for local. Real Postgres via `DATABASE_URL` for production.

## Not in v1

Custom blueprints, a self-service action runner, SSO beyond GitHub, Kubernetes ingest, scorecard editors, multi-org in one session. Those are products. This is the foundation they need.

## Run it

```bash
pnpm install
cp .env.example .env
# set AUTH_SECRET; GitHub OAuth is optional
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000), sign in with **Open the Keel demo**. You get twelve services with mixed scores. That data is the product talking, not lorem ipsum.

Without `DATABASE_URL`, Dash stores Postgres in `.data/dash`. For a real database:

```bash
docker compose up -d
# DATABASE_URL=postgres://dash:dash@localhost:5432/dash
```

```bash
pnpm test
pnpm lint
pnpm typecheck
pnpm build
```

## GitHub

Create an OAuth App. Callback: `{APP_URL}/api/auth/github/callback`. Set `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`. Scopes: `read:user`, `user:email`, `repo`, `read:org`.

Sign in with GitHub. Dash creates an organisation, stores the token encrypted at rest (`AUTH_SECRET`, AES-256-GCM), and Settings → Sync repositories will import.

## API

Demo token (local demo org only): `dash_demo_keel_local_only`

```bash
curl -H "Authorization: Bearer dash_demo_keel_local_only" http://localhost:3000/api/v1/services
```

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/api/v1/services` | Catalogue |
| GET | `/api/v1/services/:key` | Service plus scorecard outcomes |
| PATCH | `/api/v1/services/:key` | Owner, docs, lifecycle, tier. Re-evaluates. |
| GET / POST | `/api/v1/teams` | List / create |
| GET | `/api/v1/scorecards` | Rules and summary |
| GET / POST | `/api/v1/github/sync` | Connection status / sync |

## Design

[DESIGN.md](DESIGN.md) is the UI contract. Do not invent a second accent colour, drop shadows, or dark mode in a pull request that is supposed to add a column.

## License

Apache 2.0. See [LICENSE](LICENSE).

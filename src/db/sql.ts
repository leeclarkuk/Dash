/** Applied on first connect. Idempotent. Kept in TS so the app does not depend on a filesystem migrations folder at runtime. */
export const INIT_SQL = `
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS organizations_slug_idx ON organizations (slug);

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  github_id text,
  login text NOT NULL,
  name text,
  email text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS users_github_id_idx ON users (github_id);

CREATE TABLE IF NOT EXISTS memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member'
);
CREATE UNIQUE INDEX IF NOT EXISTS memberships_org_user_idx ON memberships (organization_id, user_id);

CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  description text
);
CREATE UNIQUE INDEX IF NOT EXISTS teams_org_slug_idx ON teams (organization_id, slug);

CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS team_members_idx ON team_members (team_id, user_id);

CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  key text NOT NULL,
  name text NOT NULL,
  description text,
  lifecycle text NOT NULL DEFAULT 'production',
  tier text NOT NULL DEFAULT 'standard',
  owner_team_id uuid REFERENCES teams(id) ON DELETE SET NULL,
  docs_url text,
  source text NOT NULL DEFAULT 'manual',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS services_org_key_idx ON services (organization_id, key);
CREATE INDEX IF NOT EXISTS services_org_owner_idx ON services (organization_id, owner_team_id);

CREATE TABLE IF NOT EXISTS repositories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  github_id text NOT NULL,
  name text NOT NULL,
  full_name text NOT NULL,
  url text NOT NULL,
  default_branch text NOT NULL DEFAULT 'main',
  language text,
  visibility text NOT NULL DEFAULT 'private',
  topics jsonb NOT NULL DEFAULT '[]',
  has_readme boolean NOT NULL DEFAULT false,
  has_ci boolean NOT NULL DEFAULT false,
  branch_protection boolean NOT NULL DEFAULT false,
  last_pushed_at timestamptz,
  synced_at timestamptz
);
CREATE UNIQUE INDEX IF NOT EXISTS repositories_org_github_idx ON repositories (organization_id, github_id);
CREATE INDEX IF NOT EXISTS repositories_service_idx ON repositories (service_id);

CREATE TABLE IF NOT EXISTS github_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  github_login text NOT NULL,
  github_user_id text NOT NULL,
  access_token_encrypted text NOT NULL,
  scope text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS github_connections_org_idx ON github_connections (organization_id);

CREATE TABLE IF NOT EXISTS scorecards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  slug text NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  kind text NOT NULL DEFAULT 'production-readiness'
);
CREATE UNIQUE INDEX IF NOT EXISTS scorecards_org_slug_idx ON scorecards (organization_id, slug);

CREATE TABLE IF NOT EXISTS scorecard_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scorecard_id uuid NOT NULL REFERENCES scorecards(id) ON DELETE CASCADE,
  key text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  level text NOT NULL,
  required boolean NOT NULL DEFAULT true,
  predicate jsonb NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS scorecard_rules_key_idx ON scorecard_rules (scorecard_id, key);

CREATE TABLE IF NOT EXISTS scorecard_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scorecard_id uuid NOT NULL REFERENCES scorecards(id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  evaluated_at timestamptz NOT NULL DEFAULT now(),
  passed integer NOT NULL,
  failed integer NOT NULL,
  total integer NOT NULL,
  level text NOT NULL,
  details jsonb NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS scorecard_results_unique_idx ON scorecard_results (scorecard_id, service_id);

CREATE TABLE IF NOT EXISTS api_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  token_hash text NOT NULL,
  prefix text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_used_at timestamptz
);
CREATE UNIQUE INDEX IF NOT EXISTS api_tokens_hash_idx ON api_tokens (token_hash);
`;

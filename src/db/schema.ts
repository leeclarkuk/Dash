import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import type { RuleCheck, RuleOutcome, ScoreLevel } from "@/lib/scorecards/types";

export const organizations = pgTable("organizations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [uniqueIndex("organizations_slug_idx").on(t.slug)]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  githubId: text("github_id"),
  login: text("login").notNull(),
  name: text("name"),
  email: text("email"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [uniqueIndex("users_github_id_idx").on(t.githubId)]);

export const memberships = pgTable("memberships", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  role: text("role").notNull().default("member"),
}, (t) => [
  uniqueIndex("memberships_org_user_idx").on(t.organizationId, t.userId),
]);

export const teams = pgTable("teams", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description"),
}, (t) => [uniqueIndex("teams_org_slug_idx").on(t.organizationId, t.slug)]);

export const teamMembers = pgTable("team_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  teamId: uuid("team_id")
    .notNull()
    .references(() => teams.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
}, (t) => [uniqueIndex("team_members_idx").on(t.teamId, t.userId)]);

export const services = pgTable("services", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  key: text("key").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  lifecycle: text("lifecycle").notNull().default("production"),
  tier: text("tier").notNull().default("standard"),
  ownerTeamId: uuid("owner_team_id").references(() => teams.id, {
    onDelete: "set null",
  }),
  docsUrl: text("docs_url"),
  source: text("source").notNull().default("manual"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex("services_org_key_idx").on(t.organizationId, t.key),
  index("services_org_owner_idx").on(t.organizationId, t.ownerTeamId),
]);

export const repositories = pgTable("repositories", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  serviceId: uuid("service_id")
    .notNull()
    .references(() => services.id, { onDelete: "cascade" }),
  githubId: text("github_id").notNull(),
  name: text("name").notNull(),
  fullName: text("full_name").notNull(),
  url: text("url").notNull(),
  defaultBranch: text("default_branch").notNull().default("main"),
  language: text("language"),
  visibility: text("visibility").notNull().default("private"),
  topics: jsonb("topics").$type<string[]>().notNull().default([]),
  hasReadme: boolean("has_readme").notNull().default(false),
  hasCi: boolean("has_ci").notNull().default(false),
  branchProtection: boolean("branch_protection").notNull().default(false),
  lastPushedAt: timestamp("last_pushed_at", { withTimezone: true }),
  syncedAt: timestamp("synced_at", { withTimezone: true }),
}, (t) => [
  uniqueIndex("repositories_org_github_idx").on(t.organizationId, t.githubId),
  index("repositories_service_idx").on(t.serviceId),
]);

export const githubConnections = pgTable("github_connections", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  githubLogin: text("github_login").notNull(),
  githubUserId: text("github_user_id").notNull(),
  accessTokenEncrypted: text("access_token_encrypted").notNull(),
  scope: text("scope"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [uniqueIndex("github_connections_org_idx").on(t.organizationId)]);

export const scorecards = pgTable("scorecards", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  slug: text("slug").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  kind: text("kind").notNull().default("production-readiness"),
}, (t) => [uniqueIndex("scorecards_org_slug_idx").on(t.organizationId, t.slug)]);

export const scorecardRules = pgTable("scorecard_rules", {
  id: uuid("id").primaryKey().defaultRandom(),
  scorecardId: uuid("scorecard_id")
    .notNull()
    .references(() => scorecards.id, { onDelete: "cascade" }),
  key: text("key").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  level: text("level").notNull(),
  required: boolean("required").notNull().default(true),
  check: jsonb("predicate").$type<RuleCheck>().notNull(),
}, (t) => [uniqueIndex("scorecard_rules_key_idx").on(t.scorecardId, t.key)]);

export const scorecardResults = pgTable("scorecard_results", {
  id: uuid("id").primaryKey().defaultRandom(),
  scorecardId: uuid("scorecard_id")
    .notNull()
    .references(() => scorecards.id, { onDelete: "cascade" }),
  serviceId: uuid("service_id")
    .notNull()
    .references(() => services.id, { onDelete: "cascade" }),
  evaluatedAt: timestamp("evaluated_at", { withTimezone: true }).notNull().defaultNow(),
  passed: integer("passed").notNull(),
  failed: integer("failed").notNull(),
  total: integer("total").notNull(),
  level: text("level").$type<ScoreLevel>().notNull(),
  details: jsonb("details").$type<RuleOutcome[]>().notNull(),
}, (t) => [
  uniqueIndex("scorecard_results_unique_idx").on(t.scorecardId, t.serviceId),
]);

export const apiTokens = pgTable("api_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  tokenHash: text("token_hash").notNull(),
  prefix: text("prefix").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
}, (t) => [uniqueIndex("api_tokens_hash_idx").on(t.tokenHash)]);

export const schema = {
  organizations,
  users,
  memberships,
  teams,
  teamMembers,
  services,
  repositories,
  githubConnections,
  scorecards,
  scorecardRules,
  scorecardResults,
  apiTokens,
};

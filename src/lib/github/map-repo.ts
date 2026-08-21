export type GitHubRepoInput = {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  default_branch: string;
  language: string | null;
  private: boolean;
  fork: boolean;
  archived: boolean;
  topics?: string[];
  pushed_at: string | null;
  visibility?: string;
};

export type MappedRepo = {
  skip: boolean;
  reason?: string;
  githubId: number;
  name: string;
  fullName: string;
  url: string;
  defaultBranch: string;
  language: string | null;
  visibility: "public" | "private";
  topics: string[];
  lastPushedAt: string | null;
  serviceKey: string;
  serviceName: string;
  description: string | null;
};

export function repoToServiceKey(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function humaniseRepoName(name: string): string {
  return name
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

export function mapGitHubRepo(repo: GitHubRepoInput): MappedRepo {
  if (repo.fork) {
    return {
      skip: true,
      reason: "fork",
      githubId: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      url: repo.html_url,
      defaultBranch: repo.default_branch,
      language: repo.language,
      visibility: repo.private ? "private" : "public",
      topics: repo.topics ?? [],
      lastPushedAt: repo.pushed_at,
      serviceKey: repoToServiceKey(repo.name),
      serviceName: humaniseRepoName(repo.name),
      description: repo.description,
    };
  }

  if (repo.archived) {
    return {
      skip: true,
      reason: "archived",
      githubId: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      url: repo.html_url,
      defaultBranch: repo.default_branch,
      language: repo.language,
      visibility: repo.private ? "private" : "public",
      topics: repo.topics ?? [],
      lastPushedAt: repo.pushed_at,
      serviceKey: repoToServiceKey(repo.name),
      serviceName: humaniseRepoName(repo.name),
      description: repo.description,
    };
  }

  const key = repoToServiceKey(repo.name);
  if (!key) {
    return {
      skip: true,
      reason: "empty-name",
      githubId: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      url: repo.html_url,
      defaultBranch: repo.default_branch,
      language: repo.language,
      visibility: repo.private ? "private" : "public",
      topics: repo.topics ?? [],
      lastPushedAt: repo.pushed_at,
      serviceKey: key,
      serviceName: repo.name,
      description: repo.description,
    };
  }

  return {
    skip: false,
    githubId: repo.id,
    name: repo.name,
    fullName: repo.full_name,
    url: repo.html_url,
    defaultBranch: repo.default_branch || "main",
    language: repo.language,
    visibility: repo.private || repo.visibility === "private" ? "private" : "public",
    topics: repo.topics ?? [],
    lastPushedAt: repo.pushed_at,
    serviceKey: key,
    serviceName: humaniseRepoName(repo.name),
    description: repo.description,
  };
}

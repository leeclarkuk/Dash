import { Octokit } from "octokit";

export type RepoInspection = {
  hasReadme: boolean;
  hasCi: boolean;
  branchProtection: boolean;
};

async function exists(
  octokit: Octokit,
  request: () => Promise<unknown>,
): Promise<boolean> {
  try {
    await request();
    return true;
  } catch (error) {
    const status = (error as { status?: number }).status;
    if (status === 404) return false;
    if (status === 403) return false;
    throw error;
  }
}

export async function inspectRepository(
  octokit: Octokit,
  owner: string,
  repo: string,
  defaultBranch: string,
): Promise<RepoInspection> {
  const [hasReadme, hasCi, branchProtection] = await Promise.all([
    exists(octokit, () => octokit.rest.repos.getReadme({ owner, repo })),
    exists(octokit, () =>
      octokit.rest.repos.getContent({
        owner,
        repo,
        path: ".github/workflows",
      }),
    ),
    exists(octokit, () =>
      octokit.rest.repos.getBranchProtection({
        owner,
        repo,
        branch: defaultBranch,
      }),
    ),
  ]);

  return { hasReadme, hasCi, branchProtection };
}

export async function mapPool<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;

  async function worker() {
    while (next < items.length) {
      const index = next;
      next += 1;
      results[index] = await fn(items[index]);
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

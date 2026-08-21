import { env } from "@/lib/env";

const AUTH_COOKIE = "dash_oauth_state";

export function githubAuthorizeUrl(state: string) {
  const { githubClientId, appUrl } = env();
  if (!githubClientId) {
    throw new Error("GitHub OAuth is not configured.");
  }
  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", githubClientId);
  url.searchParams.set("redirect_uri", `${appUrl}/api/auth/github/callback`);
  url.searchParams.set("state", state);
  url.searchParams.set("scope", "read:user user:email repo read:org");
  return url.toString();
}

export async function exchangeGithubCode(code: string) {
  const { githubClientId, githubClientSecret, appUrl } = env();
  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: githubClientId,
      client_secret: githubClientSecret,
      code,
      redirect_uri: `${appUrl}/api/auth/github/callback`,
    }),
  });
  if (!response.ok) {
    throw new Error(`GitHub token exchange failed (${response.status}).`);
  }
  const body = (await response.json()) as {
    access_token?: string;
    error?: string;
    scope?: string;
  };
  if (!body.access_token) {
    throw new Error(body.error || "GitHub did not return an access token.");
  }
  return { accessToken: body.access_token, scope: body.scope ?? "" };
}

export async function fetchGithubUser(accessToken: string) {
  const response = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "Dash-IDP",
    },
  });
  if (!response.ok) {
    throw new Error(`GitHub user lookup failed (${response.status}).`);
  }
  const user = (await response.json()) as {
    id: number;
    login: string;
    name: string | null;
    email: string | null;
    avatar_url: string;
  };
  return user;
}

export { AUTH_COOKIE as GITHUB_OAUTH_STATE_COOKIE };

function read(name: string, fallback = ""): string {
  return process.env[name]?.trim() || fallback;
}

function isProduction() {
  return process.env.NODE_ENV === "production";
}

const DEV_SECRET = "dash-dev-secret-not-for-production";

export function env() {
  const authSecret = read(
    "AUTH_SECRET",
    process.env.NODE_ENV === "production" ? "" : DEV_SECRET,
  );
  const appUrl = read("APP_URL", "http://localhost:3000").replace(/\/$/, "");
  const githubClientId = read("GITHUB_CLIENT_ID");
  const githubClientSecret = read("GITHUB_CLIENT_SECRET");
  const databaseUrl = read("DATABASE_URL");
  const allowDemoAuth =
    read("ALLOW_DEMO_AUTH", isProduction() ? "false" : "true") !== "false";

  return {
    authSecret,
    appUrl,
    githubClientId,
    githubClientSecret,
    databaseUrl,
    allowDemoAuth,
    githubConfigured: Boolean(githubClientId && githubClientSecret),
  };
}

export function requireAuthSecret() {
  const secret = env().authSecret;
  if (secret.length < 16) {
    throw new Error(
      "AUTH_SECRET must be set to a string of at least 16 characters. See .env.example.",
    );
  }
  return secret;
}

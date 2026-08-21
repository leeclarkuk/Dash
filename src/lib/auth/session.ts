import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { requireAuthSecret } from "@/lib/env";

export const SESSION_COOKIE = "dash_session";

export type Session = {
  userId: string;
  organizationId: string;
  login: string;
  name: string | null;
};

function secretKey() {
  return new TextEncoder().encode(requireAuthSecret());
}

export async function signSession(session: Session): Promise<string> {
  return new SignJWT(session)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("14d")
    .sign(secretKey());
}

export async function readSessionToken(token: string): Promise<Session | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (
      typeof payload.userId !== "string" ||
      typeof payload.organizationId !== "string" ||
      typeof payload.login !== "string"
    ) {
      return null;
    }
    return {
      userId: payload.userId,
      organizationId: payload.organizationId,
      login: payload.login,
      name: typeof payload.name === "string" ? payload.name : null,
    };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<Session | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return readSessionToken(token);
}

export async function setSessionCookie(session: Session) {
  const jar = await cookies();
  const token = await signSession(session);
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) {
    throw new AuthRequiredError();
  }
  return session;
}

export class AuthRequiredError extends Error {
  constructor() {
    super("Authentication required.");
    this.name = "AuthRequiredError";
  }
}

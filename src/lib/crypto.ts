import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { requireAuthSecret } from "@/lib/env";

function keyFromSecret(secret: string) {
  return createHash("sha256").update(secret).digest();
}

export function encryptSecret(plaintext: string): string {
  const key = keyFromSecret(requireAuthSecret());
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encoded = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64url")}.${tag.toString("base64url")}.${encoded.toString("base64url")}`;
}

export function decryptSecret(payload: string): string {
  const [ivB64, tagB64, dataB64] = payload.split(".");
  if (!ivB64 || !tagB64 || !dataB64) {
    throw new Error("Malformed secret payload.");
  }
  const key = keyFromSecret(requireAuthSecret());
  const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(ivB64, "base64url"));
  decipher.setAuthTag(Buffer.from(tagB64, "base64url"));
  const decoded = Buffer.concat([
    decipher.update(Buffer.from(dataB64, "base64url")),
    decipher.final(),
  ]);
  return decoded.toString("utf8");
}

export function hashToken(token: string): string {
  return createHash("sha256")
    .update(`${requireAuthSecret()}:${token}`)
    .digest("hex");
}

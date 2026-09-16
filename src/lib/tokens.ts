import { randomBytes } from "crypto";

// URL-sichere, schwer erratbare Tokens für Einladungs- und Dashboard-Links.
export function generateToken(length = 20): string {
  return randomBytes(length)
    .toString("base64url")
    .slice(0, length);
}

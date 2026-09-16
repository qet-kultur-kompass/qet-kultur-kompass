import { verifyPayload } from "./signedToken";

export const INVITE_SESSION_COOKIE = "qet_invite_session";
export const INVITE_SESSION_TTL_MS = 30 * 60 * 1000; // 30 Minuten

/** Prüft, ob das Session-Cookie eine gültige, nicht abgelaufene
 * SAP-SSO-Anmeldung für genau diesen Einladungslink bestätigt. */
export function isInviteSessionValid(cookieValue: string | undefined, inviteToken: string): boolean {
  if (!cookieValue) return false;
  const payload = verifyPayload<{ inviteToken: string }>(cookieValue);
  return payload?.inviteToken === inviteToken;
}

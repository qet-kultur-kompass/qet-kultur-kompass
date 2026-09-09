export { default } from "next-auth/middleware";

// Schützt alle /admin-Seiten (außer /admin/login) – nicht eingeloggte
// Besucher werden automatisch zum Login weitergeleitet.
export const config = {
  matcher: ["/admin/((?!login).*)"],
};

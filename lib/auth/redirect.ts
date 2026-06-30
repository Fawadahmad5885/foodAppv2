/** Allowed post-login redirect targets from the storefront auth modal. */
export function resolveAuthRedirect(
  requested: string | null,
  fallback: string,
): string {
  if (!requested) return fallback;
  if (requested === "/admin" || requested.startsWith("/admin/")) {
    return requested;
  }
  if (requested === "/vendor" || requested.startsWith("/vendor/")) {
    return requested;
  }
  return fallback;
}

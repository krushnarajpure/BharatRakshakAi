/** Sets a lightweight session cookie for middleware route protection */
export function setAuthSessionCookie(): void {
  if (typeof document === "undefined") return;
  const maxAge = 60 * 60 * 24 * 7;
  document.cookie = `firebase-auth-session=1; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function clearAuthSessionCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie =
    "firebase-auth-session=; path=/; max-age=0; SameSite=Lax";
}

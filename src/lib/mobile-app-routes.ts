/** Public report articles stay readable on phones; the rest invites users to the app. */
export function shouldInviteToMobileApp(path: string): boolean {
  if (/^\/dashboard\/my-businesses\/?$/.test(path)) return false;
  return !/^\/incidents\/[^/]+\/?$/.test(path);
}

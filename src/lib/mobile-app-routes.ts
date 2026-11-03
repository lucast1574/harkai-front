/** Public report articles stay readable on phones; the rest invites users to the app. */
export function shouldInviteToMobileApp(path: string): boolean {
  return !/^\/incidents\/[^/]+\/?$/.test(path);
}

/** Keep public content and account deletion accessible in mobile browsers. */
export function shouldInviteToMobileApp(path: string): boolean {
  if (/^\/municipalidades\/?$/.test(path)) return false;
  if (/^\/eliminar-cuenta\/?$/.test(path)) return false;
  if (path === "/dashboard/report") return false;
  if (
    path === "/comunidad" ||
    path === "/login" ||
    /^\/distritos(?:\/[^/]+)?\/?$/.test(path)
  )
    return false;
  if (/^\/dashboard\/my-businesses\/?$/.test(path)) return false;
  return !/^\/incidents\/[^/]+\/?$/.test(path);
}

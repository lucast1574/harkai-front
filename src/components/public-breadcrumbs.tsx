import Link from "next/link";
import { HOME } from "@/lib/public-seo";

export function PublicBreadcrumbs({
  section,
  href,
  current,
}: {
  section: string;
  href: string;
  current?: string;
}) {
  return (
    <nav className="public-breadcrumbs" aria-label="Ruta de navegación">
      <a href={HOME}>Harkai · Inicio</a>
      <span aria-hidden="true">/</span>
      {current ? (
        <>
          <Link href={href}>{section}</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{current}</span>
        </>
      ) : (
        <span aria-current="page">{section}</span>
      )}
    </nav>
  );
}

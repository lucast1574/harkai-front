import Link from "next/link";
export default function NotFound(): React.JSX.Element {
  return (
    <section className="panel">
      <h1>Esta página no está disponible</h1>
      <Link href="/dashboard" className="button">
        Volver a mi zona
      </Link>
    </section>
  );
}

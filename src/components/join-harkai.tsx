import Link from "next/link";
import { ArrowUpRight, MapPin, MessageCircle, Smartphone } from "lucide-react";
import styles from "./join-harkai.module.css";
export function JoinHarkai({
  report = false,
}: {
  report?: boolean;
}): React.JSX.Element {
  return (
    <aside className={styles.card} aria-label="Únete a Harkai">
      <div className={styles.art} aria-hidden="true">
        <MapPin />
        <span>
          <MessageCircle />
        </span>
      </div>
      <div className={styles.copy}>
        <span className={styles.eyebrow}>TU BARRIO, MÁS CERCA</span>
        <h2>
          {report
            ? "¿Quieres reportar algo tú también?"
            : "Tu distrito tiene mucho que contar."}
        </h2>
        <p>
          {report
            ? "Sé parte del barrio. Únete a Harkai y comparte lo que pasa cerca desde la app."
            : "Prueba Harkai gratis. Conversa con tus vecinos en la web y lleva las alertas de tu zona en el móvil."}
        </p>
        <div className={styles.actions}>
          {!report && (
            <Link className={styles.primary} href="/dashboard">
              Probar Harkai en la web <ArrowUpRight size={17} />
            </Link>
          )}
          <a href="https://play.google.com/store/apps/details?id=com.lucast.harkai">
            <Smartphone size={17} /> Android <ArrowUpRight size={15} />
          </a>
          <a href="https://apps.apple.com/app/id6829396398">
            <Smartphone size={17} /> iPhone <ArrowUpRight size={15} />
          </a>
        </div>
        <small>Gratis · Para vecinos de todo el Perú</small>
      </div>
    </aside>
  );
}

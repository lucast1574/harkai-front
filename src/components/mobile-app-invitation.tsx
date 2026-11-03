"use client";
import Image from "next/image";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import {
  MapPinned,
  MessageCircle,
  HeartHandshake,
  ArrowUpRight,
} from "lucide-react";

const subscribe = (notify: () => void) => {
  const media = window.matchMedia("(max-width: 767px)");
  media.addEventListener("change", notify);
  return () => media.removeEventListener("change", notify);
};
export function useMobileScreen(): boolean | null {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia("(max-width: 767px)").matches,
    () => null,
  );
}
export function MobileAppInvitation() {
  return (
    <main className="mobile-app-invitation" id="contenido">
      <a href="https://harkai.lat" className="mobile-app-brand">
        <Image src="/icon.png" alt="" width="44" height="44" />
        harkai.
      </a>
      <div className="mobile-app-preview" aria-label="Vista de la app Harkai">
        <div className="mobile-preview-phone">
          <Image
            src="/app/mapa.webp"
            alt="Mapa de Harkai con datos de demostración"
            width="650"
            height="1413"
          />
        </div>
        <div className="mobile-preview-features">
          <span>
            <MapPinned size={18} aria-hidden="true" /> Tu zona
          </span>
          <span>
            <MessageCircle size={18} aria-hidden="true" /> Tu comunidad
          </span>
          <span>
            <HeartHandshake size={18} aria-hidden="true" /> Ayuda cercana
          </span>
          <small>Todo, en tu bolsillo.</small>
        </div>
      </div>
      <div className="mobile-app-copy">
        <p className="mobile-app-label">Harkai en tu teléfono</p>
        <h1>
          Tu comunidad,
          <br />
          contigo.
        </h1>
        <p>
          Prueba la app de Harkai para explorar tu zona, compartir reportes y
          encontrar ayuda cercana desde tu celular.
        </p>
        <nav aria-label="Descargar Harkai" className="mobile-app-stores">
          <a href="https://apps.apple.com/app/id6829396398">
            Descargar en App Store <ArrowUpRight size={20} aria-hidden="true" />
          </a>
          <a href="https://play.google.com/store/apps/details?id=com.lucast.harkai">
            Probar en Google Play <ArrowUpRight size={20} aria-hidden="true" />
          </a>
        </nav>
        <p className="mobile-app-note">
          Android está disponible para los participantes de las pruebas. En
          iPhone, descarga Harkai desde App Store.
        </p>
        <a className="mobile-app-about" href="https://harkai.lat/#app">
          Conoce la app
        </a>
        <Link className="mobile-app-about" href="/dashboard/my-businesses">
          Pon tu negocio en el mapa gratis
        </Link>
      </div>
      <p className="mobile-app-footer">
        Hecho para nuestras comunidades en Perú.
      </p>
    </main>
  );
}

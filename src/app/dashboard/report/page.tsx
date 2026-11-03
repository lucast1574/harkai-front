import Image from "next/image";
import { StoreLinks } from "@/components/store-links";
import { Camera, MapPin, MessageCircle } from "lucide-react";
export default function Page(): React.JSX.Element {
  return (
    <section className="report-download">
      <div className="report-download-copy">
        <span className="eyebrow">HAZTE PARTE DEL BARRIO</span>
        <h1>
          Reporta desde
          <br />
          tu teléfono.
        </h1>
        <p>
          Lo que ves puede ayudar a alguien cerca. Comparte una alerta con
          ubicación, foto, audio o texto desde la app de Harkai.
        </p>
        <ul>
          <li>
            <MapPin size={20} /> Ubica lo que está pasando
          </li>
          <li>
            <Camera size={20} /> Añade contexto y evidencia
          </li>
          <li>
            <MessageCircle size={20} /> Informa a tu comunidad
          </li>
        </ul>
        <StoreLinks />
        <small>Usa la misma cuenta en la web y en la app.</small>
      </div>
      <figure className="report-download-preview">
        <span className="report-stage-word" aria-hidden="true">
          CERCA.
        </span>
        <div className="report-phone-stack">
          <div className="report-download-phone report-phone-back report-phone-left">
            <Image
              src="/app/comunidad.webp"
              alt="Conversaciones y alertas de la comunidad en Harkai"
              width={650}
              height={1413}
              sizes="(max-width: 600px) 42vw, 230px"
            />
          </div>
          <div className="report-download-phone report-phone-back report-phone-right">
            <Image
              src="/app/reportar.webp"
              alt="Formulario para compartir un reporte desde la app"
              width={650}
              height={1413}
              sizes="(max-width: 600px) 42vw, 230px"
            />
          </div>
          <div className="report-download-phone report-phone-front">
            <Image
              src="/app/mapa.webp"
              alt="Mapa de la app Harkai con reportes cercanos y datos de demostración"
              width={650}
              height={1413}
              sizes="(max-width: 600px) 50vw, 280px"
            />
          </div>
        </div>
        <figcaption>
          <strong>Tu zona, en el mapa.</strong>
          <span>Lo que pasa cerca, contigo donde vayas.</span>
          <small>Vista de la app con datos de demostración.</small>
        </figcaption>
      </figure>
    </section>
  );
}

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
        <div className="report-download-phone">
          <Image
            src="/app/reportar.webp"
            alt="Pantalla para crear un reporte en la app Harkai, con datos de demostración"
            width={650}
            height={1413}
          />
        </div>
        <figcaption>Tu voz también cuida el barrio.</figcaption>
      </figure>
    </section>
  );
}

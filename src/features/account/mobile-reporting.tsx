import { Smartphone, ShieldCheck, MessageCircle, Radio } from "lucide-react";

export function MobileReporting(): React.JSX.Element {
  return (
    <section id="app-movil" className="panel mobile-reporting">
      <div className="mobile-reporting-top">
        <span className="account-feature-icon">
          <Smartphone size={22} />
        </span>
        <div>
          <span className="eyebrow">DESDE TU CELULAR</span>
          <h2>Publica alertas con la app móvil de Harkai</h2>
        </div>
      </div>
      <p>
        Los nuevos reportes en terreno se publican desde la app móvil con foto,
        audio o texto. Usa esta misma cuenta para seguirlos en el mapa web y
        conversar con tu barrio.
      </p>
      <div className="mobile-reporting-benefits">
        <span>
          <Radio size={14} /> Audio, foto o texto
        </span>
        <span>
          <ShieldCheck size={14} /> Evidencia y ubicación
        </span>
        <span>
          <MessageCircle size={14} /> Sincronizado con la web
        </span>
      </div>
    </section>
  );
}

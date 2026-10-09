import { Smartphone, ShieldCheck, MessageCircle } from "lucide-react";
export function MobileReporting(): React.JSX.Element {
  return (
    <section id="app-movil" className="panel mobile-reporting">
      <span className="account-feature-icon">
        <Smartphone size={24} />
      </span>
      <div>
        <span className="eyebrow">DESDE TU CELULAR</span>
        <h2>Publica con la app de Harkai</h2>
        <p>
          Los nuevos reportes se crean en la app móvil. Usa la misma cuenta para
          verlos, conversar y administrar tu actividad en esta web.
        </p>
        <div className="mobile-reporting-benefits">
          <span>
            <ShieldCheck size={16} /> Revisa lugar y evidencia
          </span>
          <span>
            <MessageCircle size={16} /> Una conversación en web y móvil
          </span>
        </div>
        <p className="muted small">
          La versión renovada todavía no tiene una descarga pública. Si ya
          tienes la app de pruebas, entra con esta misma cuenta.
        </p>
      </div>
    </section>
  );
}

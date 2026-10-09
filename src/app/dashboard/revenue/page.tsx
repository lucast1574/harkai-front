import { Access } from "@/components/access";
import { Heading, Notice } from "@/components/ui";
export default function Page(): React.JSX.Element {
  return (
    <Access roles={["admin"]}>
      <Heading title="Ganancias" />
      <section className="panel">
        <h2>Pagos desactivados</h2>
        <Notice>
          No hay un proveedor de pagos conectado ni cobros activos. El registro
          de ingresos se habilitará al integrar Stripe.
        </Notice>
      </section>
    </Access>
  );
}

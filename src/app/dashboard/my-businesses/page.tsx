import { BusinessWorkspace } from "@/features/business/business-workspace";
import { Suspense } from "react";
export default function Page(): React.JSX.Element {
  return (
    <Suspense fallback={<p>Cargando tus negocios…</p>}>
      <BusinessWorkspace />
    </Suspense>
  );
}

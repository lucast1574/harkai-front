import type { Metadata } from "next";
import { MunicipalContact } from "@/features/municipal/municipal-contact";
export const metadata: Metadata = {
  title: "Acceso municipal",
  description:
    "Solicita información sobre el acceso institucional de Harkai para tu municipalidad. Coordinamos el alcance por acuerdo directo.",
  alternates: { canonical: "https://panel.harkai.lat/municipalidades" },
};
export default function Page(): React.JSX.Element {
  return <MunicipalContact />;
}

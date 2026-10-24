import type { Metadata } from "next";
import { DeleteAccount } from "@/features/account/delete-account";
export const metadata: Metadata = {
  title: "Eliminar cuenta y datos",
  description: "Elimina tu cuenta de Harkai y sus datos desde el panel web.",
  alternates: { canonical: "https://panel.harkai.lat/eliminar-cuenta" },
  robots: { index: false, follow: true },
};
export default function Page(): React.JSX.Element {
  return <DeleteAccount />;
}

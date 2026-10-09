import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth";
import { Shell } from "@/components/shell";
import "./globals.css";
export const metadata: Metadata = {
  title: { default: "Harkai · Tu comunidad", template: "%s · Harkai" },
  description: "Reportes comunitarios, mapas e información útil sobre tu zona.",
  metadataBase: new URL("https://panel.harkai.lat"),
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <Shell>{children}</Shell>
        </AuthProvider>
      </body>
    </html>
  );
}

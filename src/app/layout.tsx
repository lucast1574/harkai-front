import type { Metadata } from "next";
import "./globals.css";
// import { Header } from "@/components/header";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/auth/auth-context";
import { ConfigProvider } from "@/lib/config/config-context";

export const metadata: Metadata = {
  title: "Harkai — Panel de la comunidad",
  description:
    "Reportes comunitarios, mapas e información útil sobre tu zona.",
  authors: [
    {
      name: "Lucas Santillán",
      url: "https://github.com/Luc4st1574",
    },
  ],
  keywords: [
    "Harkai",
    "Seguridad Urbana",
    "Incidentes",
    "Verificación",
    "Plataforma",
    "Ciudadana",
    "Hackathon",
    "Security",
    "Experience",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className="antialiased bg-background text-foreground"
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <ConfigProvider>
              {/* <Header /> */}
              {children}
            </ConfigProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

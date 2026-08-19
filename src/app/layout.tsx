import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { AppShell } from "@/components/layout/app-shell";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Radar de Eventos y Congregaciones",
    template: "%s · Radar de Eventos",
  },
  description:
    "Rastreo, clasificación y alerta anticipada de congregaciones masivas y eventos profesionales por ciudad.",
};

// Todo el shell depende de la fecha de hoy (contador de alertas activas), así
// que ninguna ruta debe servirse desde un HTML prerenderizado en build.
export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Dark mode estricto: la clase `dark` es fija, no hay alternador de tema.
    <html lang="es-CL" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}

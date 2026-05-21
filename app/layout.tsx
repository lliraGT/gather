import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gather — Centro Bíblico El Camino",
  description: "Sistema de registro de asistencia",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css"/>
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

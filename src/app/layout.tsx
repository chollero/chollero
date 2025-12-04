import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // <--- ESTA LÍNEA ES LA CLAVE, SIN ELLA NO HAY DISEÑO
import GlobalHeader from '@/components/GlobalHeader'; // <-- NUEVA IMPORTACIÓN

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Chollero",
  description: "La mejor comunidad de chollos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="font-sans">
        <GlobalHeader /> {/* <-- AÑADIDO AQUÍ */}
        {children}
      </body>
    </html>
  );
}
import { ReactNode } from "react";
import { Inter } from 'next/font/google';
import "./globals.css";

// Configuración de la fuente Inter como alternativa a Geist
const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'tggleMax',
  description: 'Aplicación de seguimiento de tiempo',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <main>{children}</main>
      </body>
    </html>
  );
}
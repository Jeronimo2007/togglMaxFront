import { ReactNode } from "react";
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import "./globals.css";

// Metadata debe estar antes del componente
export const metadata = {
  title: 'tggleMax',
  description: 'Aplicación de seguimiento de tiempo',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className={GeistSans.className}>
        <main>{children}</main>
      </body>
    </html>
  );
}
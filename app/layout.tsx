
import { ReactNode } from "react";
import "./globals.css"; // Asegúrate de importar tus estilos globales

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <head>
        {/* Aquí puedes agregar metadatos o enlaces adicionales, como fuentes */}
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>tggleMax</title>
      </head>
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}

import { ReactNode } from "react";
import { Inter as FontSans } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { ThemeToggle } from "@/components/theme-toggle";
import "./globals.css";
import { cn } from "@/lib/utils";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: 'tggleMax',
  description: 'Aplicación de seguimiento de tiempo',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body 
        className={cn(
          fontSans.variable,
          "font-sans antialiased",
          "min-h-screen",
          "bg-main-bg text-main-text"
        )}
      >
        <ThemeProvider 
          attribute="class" 
          defaultTheme="custom" 
          enableSystem={false}
          disableTransitionOnChange
        >
          <div className="relative min-h-screen">
            <div className="fixed right-4 top-4 z-50">
              <ThemeToggle />
            </div>
            <main>{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
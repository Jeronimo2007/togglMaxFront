import { ReactNode } from "react";
import { Inter as FontSans } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { ThemeToggle } from "@/components/theme-toggle";
import "./globals.css";

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
      <body className={`${fontSans.variable} font-sans antialiased min-h-screen bg-background dark:bg-slate-950`}>
        <ThemeProvider 
          attribute="class" 
          defaultTheme="dark" 
          enableSystem={false}
          disableTransitionOnChange
        >
          <div className="relative min-h-screen bg-background dark:bg-slate-950">
            <div className="fixed right-4 top-4 z-50">
              <ThemeToggle />
            </div>
            <main className="min-h-screen bg-background dark:bg-slate-950">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
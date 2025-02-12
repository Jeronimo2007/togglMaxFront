"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Timer, BarChart } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background dark:bg-slate-950">
        <p className="text-foreground">Verificando autenticación...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background dark:bg-slate-950">
      {/* Sidebar */}
      <aside className="w-64 bg-card dark:bg-slate-900 text-card-foreground flex flex-col p-4 min-h-screen fixed border-r border-border">
        {/* Logo Circular */}
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 bg-muted dark:bg-slate-800 rounded-full"></div>
        </div>

        {/* Opciones de Menú */}
        <nav className="flex flex-col space-y-2">
          <Link
            href="/dashboard/timer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <Timer className="w-5 h-5" />
            Timer
          </Link>
          <Link
            href="/dashboard/report"
            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <BarChart className="w-5 h-5" />
            Report
          </Link>
        </nav>

        {/* Theme Toggle en la parte inferior del sidebar */}
        <div className="mt-auto pb-4">
          <ThemeToggle />
        </div>
      </aside>

      {/* Contenido */}
      <main className="flex-1 p-6 bg-background dark:bg-slate-950 ml-64 min-h-screen">
        {children}
      </main>
    </div>
  );
}
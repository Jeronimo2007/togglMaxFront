"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Timer, BarChart } from "lucide-react";

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
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600">Verificando autenticación...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col p-4 min-h-screen fixed">
        {/* Logo Circular */}
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 bg-gray-500 rounded-full"></div>
        </div>

        {/* Opciones de Menú */}
        <nav className="flex flex-col space-y-2">
          <Link
            href="/dashboard/timer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-800"
          >
            <Timer className="w-5 h-5" />
            Timer
          </Link>
          <Link
            href="/dashboard/report"
            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-800"
          >
            <BarChart className="w-5 h-5" />
            Report
          </Link>
        </nav>
      </aside>

      {/* Contenido */}
      <main className="flex-1 p-6 bg-gray-100 ml-64">
        {children}
      </main>
    </div>
  );
}
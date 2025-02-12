"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format, isValid, parseISO, startOfWeek, endOfWeek } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface ReportData {
  id: number;
  descripcion: string;
  duracion: number;
  fecha_inicio: string;
  fecha_fin: string;
  project: string;
}

interface SummaryData {
  project: string;
  total_seconds: number;
}

interface ApiResponse {
  status: string;
  message: string;
  data: ReportData[];
  summary: SummaryData[];
}

export default function ReportPage() {
  // Initialize with current week's start and end dates
  const [startDate, setStartDate] = useState(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 }); // 1 represents Monday
    return format(start, "yyyy-MM-dd");
  });
  
  const [endDate, setEndDate] = useState(() => {
    const end = endOfWeek(new Date(), { weekStartsOn: 1 }); // 1 represents Monday
    return format(end, "yyyy-MM-dd");
  });

  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [summary, setSummary] = useState<SummaryData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isValidDateFormat = (dateString: string) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    const date = parseISO(dateString);
    return isValid(date);
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const fetchReport = async () => {
    if (!isValidDateFormat(startDate) || !isValidDateFormat(endDate)) {
      setError("Las fechas deben estar en formato YYYY-MM-DD");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No se encontró el token de autenticación");
      }

      const url = new URL(`${process.env.NEXT_PUBLIC_BACKEND_URL}/report/get`);
      url.searchParams.append("token", token);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          start: startDate,
          end: endDate
        })
      });

      const responseData = await response.text();
      console.log('Raw response:', responseData);

      if (!response.ok) {
        try {
          const errorData = JSON.parse(responseData);
          throw new Error(
            errorData.detail?.[0]?.msg || 
            errorData.detail || 
            `Error ${response.status}: ${response.statusText}`
          );
        } catch (e) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
      }

      try {
        const data: ApiResponse = JSON.parse(responseData);
        if (data.status === "success") {
          setReportData(data.data || []);
          setSummary(data.summary || []);
        } else {
          throw new Error(data.message || "Error al procesar la solicitud");
        }
      } catch (e) {
        throw new Error("Error al procesar la respuesta del servidor");
      }
    } catch (error) {
      console.error("Error al obtener reportes:", error);
      setError(error instanceof Error ? error.message : "Error al obtener los reportes");
      setReportData([]);
      setSummary([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (value: string, setDate: (date: string) => void) => {
    try {
      if (isValidDateFormat(value)) {
        setDate(value);
        setError("");
      } else {
        setError("Formato de fecha inválido. Use YYYY-MM-DD");
      }
    } catch (error) {
      setError("Error al procesar la fecha");
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const chartData = reportData.map(item => ({
    date: item.fecha_inicio.split('T')[0],
    seconds: item.duracion,
    project: item.project
  }));

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Reportes de Tiempo</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="flex space-x-4">
        <div>
          <label className="block text-sm font-semibold">Fecha de Inicio:</label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => handleDateChange(e.target.value, setStartDate)}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold">Fecha de Fin:</label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => handleDateChange(e.target.value, setEndDate)}
          />
        </div>
        <Button 
          onClick={fetchReport} 
          disabled={loading || !!error}
          className="mt-6"
        >
          {loading ? "Cargando..." : "Actualizar Reporte"}
        </Button>
      </div>

      {/* Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {summary.map((item, index) => (
          <div
            key={index}
            className="p-4 bg-black rounded-lg shadow border border-black"
          >
            <h3 className="text-lg font-semibold mb-2">{item.project}</h3>
            <p className="text-gray-600">
              Tiempo total: {formatDuration(item.total_seconds)}
            </p>
          </div>
        ))}
      </div>

      {/* Chart Section */}
      <div className="h-[400px] bg-black p-4 rounded-lg shadow border border-gray-200">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip 
              formatter={(value: number) => formatDuration(value)}
              labelFormatter={(label) => `Fecha: ${label}`}
            />
            <Bar dataKey="seconds" fill="#8884d8" name="Tiempo" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed List Section */}
      <div className="bg-black rounded-lg shadow border border-black">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#D6AEDD] uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#D6AEDD] uppercase tracking-wider">
                  Proyecto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#D6AEDD] uppercase tracking-wider">
                  Tiempo
                </th>
              </tr>
            </thead>
            <tbody className="bg-black divide-y divide-gray-200">
              {reportData.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.fecha_inicio.split('T')[0]}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.project}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {formatDuration(item.duracion)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
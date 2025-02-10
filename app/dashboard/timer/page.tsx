"use client";

import React, { useState, useEffect, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function Home() {
  const calendarRef = useRef<FullCalendar>(null);
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [projects, setProjects] = useState([]); // Lista de proyectos
  const [selectedProject, setSelectedProject] = useState(""); // Proyecto seleccionado
  const [newProjectName, setNewProjectName] = useState(""); // Nuevo proyecto
  const [taskDescription, setTaskDescription] = useState(""); // Descripción de la tarea

  // Obtener proyectos del backend
  const fetchProjects = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/project/get", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      if (data.status === "success") {
        setProjects(data.data);
      }
    } catch (error) {
      console.error("Error al obtener proyectos:", error);
    }
  };

  // Agregar un nuevo proyecto
  const createProject = async () => {
    if (!newProjectName.trim()) return;

    try {
      const response = await fetch("http://127.0.0.1:8000/project/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ project_name: newProjectName }),
      });

      if (response.ok) {
        setNewProjectName(""); // Limpiar el input
        fetchProjects(); // Volver a obtener los proyectos
      }
    } catch (error) {
      console.error("Error al crear proyecto:", error);
    }
  };

  // Obtener proyectos al cargar el componente
  useEffect(() => {
    fetchProjects();
  }, []);

  // Manejo del Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Guardar sesión de trabajo
  const saveSession = async () => {
    if (!selectedProject || !taskDescription.trim()) {
      alert("Selecciona un proyecto y agrega una descripción.");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/task/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          project_id: selectedProject,
          description: taskDescription,
          duration: time, // En segundos
        }),
      });

      if (response.ok) {
        alert("Sesión guardada correctamente.");
        setTime(0);
        setTaskDescription("");
        setIsRunning(false);
      }
    } catch (error) {
      console.error("Error al guardar la sesión:", error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Temporizador con selector de proyectos */}
      <div className="p-4 bg-gray-800 text-white rounded-lg space-y-4">
        <h2 className="text-lg font-bold">Temporizador</h2>
        <span className="text-2xl">{formatTime(time)}</span>

        <div className="space-x-2">
          <Button onClick={() => setIsRunning(!isRunning)}>
            {isRunning ? "Pause" : "Start"}
          </Button>
          <Button onClick={() => setTime(0)}>Reset</Button>
        </div>

        {/* Seleccionar Proyecto */}
        <div className="mt-4">
          <label className="block text-sm">Proyecto:</label>
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un proyecto" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Descripción de la tarea */}
        <div className="mt-4">
          <label className="block text-sm">Descripción de la tarea:</label>
          <Textarea
            placeholder="Describe tu tarea..."
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
          />
        </div>

        <Button onClick={saveSession} className="mt-4 w-full">
          Guardar Sesión
        </Button>
      </div>

      {/* Sección de Creación de Proyectos */}
      <div className="space-y-4 p-4 bg-gray-200 rounded-lg">
        <h3 className="text-lg font-bold">Gestionar Proyectos</h3>
        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder="Nuevo proyecto"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
          />
          <Button onClick={createProject}>Crear</Button>
        </div>
      </div>

      {/* Calendario con tamaño fijo */}
      <div className="overflow-hidden" style={{ height: "500px" }}>
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={false}
          editable
          selectable
          height="100%"
          events={[{ title: "Task 1", start: new Date() }]}
        />
      </div>
    </div>
  );
}

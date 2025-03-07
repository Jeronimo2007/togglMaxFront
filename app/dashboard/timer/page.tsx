'use client'

import React, { useRef, useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import type { EventApi, DateSelectArg, EventClickArg } from "@fullcalendar/core";
import type { DateClickArg } from "@fullcalendar/interaction";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import * as Dialog from "@radix-ui/react-dialog";

// Utility function to format seconds into HH:MM:SS
function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

// Interfaces
interface Project {
  id: string;
  name: string;
  color: string;
}

interface NewEvent {
  start: Date;
  end: Date;
  project: string;
  descripcion?: string;
}

interface EventData {
  id: string;
  title: string;
  start: string;
  end: string;
  display: string;
  allDay: boolean;
  editable: boolean;
  durationEditable: boolean;
  eventResizableFromStart: boolean;
  extendedProps: {
    project: string;
    duracion: string;
    descripcion?: string;
  };
}

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  newEvent: NewEvent | null;
  setNewEvent: (event: NewEvent | null) => void;
  onSave: () => void;
  projects: Project[];
}

// Modal para agregar evento manual (ya existente)
const AddEventModal: React.FC<AddEventModalProps> = ({
  isOpen,
  onClose,
  newEvent,
  setNewEvent,
  onSave,
  projects,
}) => {
  const adjustTimeZone = (date: Date): string => {
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - userTimezoneOffset)
      .toISOString()
      .slice(0, 16);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[48]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black rounded-lg p-6 w-[95vw] max-w-md max-h-[85vh] overflow-y-auto z-[49]">
          <Dialog.Title className="text-lg font-bold mb-4">
            Agregar Nuevo Evento
          </Dialog.Title>
          <div className="space-y-4">
            <div>
              <Label>Fecha y Hora Inicio</Label>
              <Input
                type="datetime-local"
                required
                className="!bg-[#aa69b9] !text-black"
                value={newEvent?.start ? adjustTimeZone(newEvent.start) : ""}
                onChange={(e) => {
                  const date = new Date(e.target.value);
                  if (!isNaN(date.getTime())) {
                    setNewEvent({
                      ...newEvent!,
                      start: date,
                      end:
                        newEvent?.end ||
                        new Date(date.getTime() + 3600000),
                    });
                  }
                }}
              />
            </div>
            <div>
              <Label>Fecha y Hora Fin</Label>
              <Input
                type="datetime-local"
                required
                className="!bg-[#aa69b9] !text-black"
                value={newEvent?.end ? adjustTimeZone(newEvent.end) : ""}
                onChange={(e) => {
                  const date = new Date(e.target.value);
                  if (!isNaN(date.getTime())) {
                    setNewEvent({
                      ...newEvent!,
                      end: date,
                    });
                  }
                }}
              />
            </div>
            <div>
              <Label>Proyecto</Label>
              <Select
                value={newEvent?.project}
                onValueChange={(value) =>
                  setNewEvent({ ...newEvent!, project: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un proyecto" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.name}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Descripción (Opcional)</Label>
              <Textarea
                value={newEvent?.descripcion}
                onChange={(e) =>
                  setNewEvent({
                    ...newEvent!,
                    descripcion: e.target.value,
                  })
                }
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Dialog.Close asChild>
                <Button variant="outline">Cancelar</Button>
              </Dialog.Close>
              <Button onClick={onSave}>Guardar</Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

// Modal para iniciar el temporizador desde el dummy event
interface TimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  projects: Project[];
  selectedProject: string;
  setSelectedProject: (project: string) => void;
  taskDescription: string;
  setTaskDescription: (desc: string) => void;
}

const TimerEventModal: React.FC<TimerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  projects,
  selectedProject,
  setSelectedProject,
  taskDescription,
  setTaskDescription,
}) => {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[48]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black rounded-lg p-6 w-[95vw] max-w-md z-[49]">
          <Dialog.Title className="text-lg font-bold mb-4">
            Iniciar Temporizador
          </Dialog.Title>
          <div className="space-y-4">
            <div>
              <Label>Proyecto</Label>
              <Select
                value={selectedProject}
                onValueChange={setSelectedProject}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un proyecto" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.name}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Descripción</Label>
              <Textarea
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                placeholder="Describe tu tarea..."
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Dialog.Close asChild>
                <Button variant="outline">Cancelar</Button>
              </Dialog.Close>
              <Button onClick={onSave}>Guardar y Empezar</Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default function Home() {
  // Referencia del calendario
  const calendarRef = useRef<FullCalendar>(null);

  const [time, setTime] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [taskDescription, setTaskDescription] = useState<string>("");
  const [events, setEvents] = useState<EventData[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [newEvent, setNewEvent] = useState<NewEvent | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [isUpdateProjectModalOpen, setIsUpdateProjectModalOpen] = useState(false);
  const [updateProjectColor, setUpdateProjectColor] = useState<string>("#aa69b9");
  const [updateProjectRate, setUpdateProjectRate] = useState<number | null>(null);
  const [newProjectColor, setNewProjectColor] = useState<string>("#aa69b9");
  const [hourlyRate, setHourlyRate] = useState<number | null>(null);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [calendarKey, setCalendarKey] = useState<number>(Date.now());

  // Nuevo estado para el dummy event y modal de temporizador
  const [dummyEvent, setDummyEvent] = useState<EventData | null>(null);
  const [showTimerModal, setShowTimerModal] = useState<boolean>(false);

  // Altura fija del calendario
  const calendarContainerHeight = 1500;

  // Función para actualizar el dummy event usando el endpoint /event/tiempo_actual
  const updateDummyEvent = async (): Promise<void> => {
    try {
      const now = new Date();
      now.setSeconds(0, 0); // Asegurar que sea un tiempo redondeado

      const end = new Date(now.getTime() + 60000); // 1 minuto después

      const dummy: EventData = {
        id: "dummy-timer-event",
        title: "", // Sin texto visible
        start: now.toISOString(),
        end: end.toISOString(),
        display: "block",
        allDay: false,
        editable: false,
        durationEditable: false,
        eventResizableFromStart: false,
        extendedProps: {
          project: "",
          duracion: "",
          descripcion: "",
        },
      };

      setDummyEvent(dummy);
    } catch (error) {
      console.error("Error al actualizar el dummy event:", error);
    }
  };


  // Efecto para actualizar el dummy event cada minuto
  useEffect(() => {
    updateDummyEvent(); // actualización inicial
    const interval = setInterval(() => {
      updateDummyEvent();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Efecto para cargar proyectos y eventos al cargar la página y al cambiar el foco/visibilidad
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchEvents();
      }
    };
    const handleFocus = () => {
      fetchEvents();
    };
    fetchProjects();
    fetchEvents();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  // Temporizador
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const handleDateClick = (info: DateClickArg): void => {
    const clickedDate = new Date(info.date);
    const end = new Date(clickedDate);
    end.setHours(end.getHours() + 1);
    setNewEvent({
      start: clickedDate,
      end: end,
      project: "",
      descripcion: "",
    });
  };

  const handleSelect = (info: DateSelectArg): void => {
    setNewEvent({
      start: info.start,
      end: info.end,
      project: "",
      descripcion: "",
    });
  };

  const saveNewEvent = async (): Promise<void> => {
    if (!newEvent?.project) {
      alert("Por favor, selecciona un proyecto");
      return;
    }
    if (newEvent.end <= newEvent.start) {
      alert("La fecha de fin debe ser posterior a la fecha de inicio");
      return;
    }
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/event/eventos/manual/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            project: newEvent.project,
            descripcion: newEvent.descripcion || "",
            fecha_inicio: newEvent.start.toISOString(),
            fecha_fin: newEvent.end.toISOString(),
          }),
        }
      );
      if (response.ok) {
        setNewEvent(null);
        fetchEvents();
      } else {
        const errorData = await response.json();
        alert(errorData.detail || "Error al guardar el evento");
      }
    } catch (error) {
      console.error("Error al guardar el evento:", error);
      alert("Error de conexión al servidor");
    }
  };

  const saveTimerEvent = async (): Promise<void> => {
    if (!selectedProject) {
      alert("Por favor, selecciona un proyecto");
      return;
    }
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/event/eventos/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            project: selectedProject,
            descripcion: taskDescription || "",
            duracion: time,
          }),
        }
      );
      if (response.ok) {
        setTime(0);
        setIsRunning(false);
        setTaskDescription("");
        fetchEvents();
      } else {
        alert("Error al guardar el evento");
      }
    } catch (error) {
      console.error("Error al guardar el evento:", error);
      alert("Error de conexión al servidor");
    }
  };

  const updateEventDates = async (info: any) => {
    try {
      const eventId = info.event.id;
      const newStart: Date = info.event.start;
      const newEnd: Date = info.event.end || new Date(newStart.getTime() + 3600000);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/event/${eventId}/dates`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            fecha_inicio: newStart.toISOString(),
            fecha_fin: newEnd.toISOString(),
          }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.detail || "Error al actualizar las fechas del evento");
        info.revert();
      }
    } catch (error) {
      console.error("Error al actualizar fechas del evento:", error);
      alert("Error de conexión al servidor al actualizar fechas");
      info.revert();
    }
  };

  const handleEventDrop = async (info: any) => {
    await updateEventDates(info);
  };

  const handleEventResize = async (info: any) => {
    await updateEventDates(info);
  };

  // Modificar el comportamiento al hacer click en un evento:
  // Si es el dummy event, abrir el TimerEventModal.
  const handleEventClick = (info: EventClickArg): void => {
    if (info.event.id === "dummy-timer-event") {
      setShowTimerModal(true);
    } else {
      setSelectedEvent(info.event);
    }
  };

  const deleteEvent = async (eventId: string): Promise<void> => {
    if (!eventId) {
      console.error("ID de evento no proporcionado");
      return;
    }
    if (!confirm("¿Estás seguro de que deseas eliminar este evento?")) {
      return;
    }
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/event/eventos/${eventId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.ok) {
        setSelectedEvent(null);
        fetchEvents();
      } else {
        const errorData = await response.json();
        alert(errorData.detail || "Error al eliminar el evento");
      }
    } catch (error) {
      console.error("Error al eliminar el evento:", error);
      alert("Error de conexión al servidor");
    }
  };

  const deleteProject = async (projectName: string): Promise<void> => {
    if (
      !confirm(
        `¿Estás seguro de que deseas eliminar el proyecto "${projectName}" y todos sus eventos?`
      )
    ) {
      return;
    }
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/project/delete/${projectName}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.ok) {
        if (selectedProject === projectName) {
          setSelectedProject("");
        }
        fetchProjects();
        fetchEvents();
      } else {
        const errorData = await response.json();
        alert(errorData.detail || "Error al eliminar el proyecto");
      }
    } catch (error) {
      console.error("Error al eliminar el proyecto:", error);
      alert("Error de conexión al servidor");
    }
  };

  const updateProject = async (): Promise<void> => {
    if (!selectedProject) return;
    if (updateProjectRate === null) {
      alert("Por favor ingrese una tarifa válida");
      return;
    }
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/project/update/${selectedProject}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            bill: updateProjectRate,
            color: updateProjectColor,
          }),
        }
      );
      if (response.ok) {
        await fetchProjects();
        setIsUpdateProjectModalOpen(false);
      } else {
        const errorData = await response.json();
        alert(errorData.detail || "Error al actualizar el proyecto");
      }
    } catch (error) {
      console.error("Error al actualizar el proyecto:", error);
      alert("Error de conexión al servidor");
    }
  };

  const createProject = async () => {
    if (!newProjectName.trim() || hourlyRate === null) {
      alert("Por favor ingrese un nombre de proyecto y su tarifa por hora");
      return;
    }
    setIsCreatingProject(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/project/add`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            project_name: newProjectName,
            bill: hourlyRate,
            color: newProjectColor,
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Error al crear el proyecto");
      }
      await fetchProjects();
      setNewProjectName("");
      setHourlyRate(null);
      setNewProjectColor("#aa69b9");
      setIsProjectModalOpen(false);
    } catch (error) {
      console.error("Error:", error);
      alert("Error al crear el proyecto");
    } finally {
      setIsCreatingProject(false);
    }
  };

  const fetchProjects = async (): Promise<void> => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/project/get`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await response.json();
      if (data.status === "success") {
        const projectsData = data.data.map((project: any) => ({
          ...project,
          color: project.color || "#999999",
        }));
        setProjects(projectsData);
        setCalendarKey(Date.now());
      }
    } catch (error) {
      console.error("Error al obtener proyectos:", error);
    }
  };

  const fetchEvents = async (): Promise<void> => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/event/eventos/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await response.json();
      if (data.status === "success") {
        const formattedEvents = data.data.map((event: any) => ({
          id: event.id,
          title: event.project,
          start: new Date(event.fecha_inicio).toISOString(),
          end: new Date(event.fecha_fin).toISOString(),
          display: "block",
          allDay: false,
          editable: true,
          durationEditable: true,
          eventResizableFromStart: true,
          extendedProps: {
            project: event.project,
            duracion: formatTime(event.duracion),
            descripcion: event.descripcion,
          },
        }));
        setEvents(formattedEvents);
        if (calendarRef.current) {
          calendarRef.current.getApi().refetchEvents();
        }
      }
    } catch (error) {
      console.error("Error al obtener eventos:", error);
    }
  };

  // Manejador para guardar desde el TimerEventModal: iniciar el temporizador automáticamente
  const handleTimerModalSave = () => {
    if (!selectedProject) {
      alert("Por favor, selecciona un proyecto");
      return;
    }
    // Reiniciar el temporizador y comenzar a contar
    setTime(0);
    setIsRunning(true);
    setShowTimerModal(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="p-6 bg-gray-800 text-white rounded-lg space-y-4">
        <h2 className="text-lg font-bold">Temporizador</h2>
        <span className="text-2xl">
          {(() => {
            const hours = Math.floor(time / 3600)
              .toString()
              .padStart(2, "0");
            const minutes = Math.floor((time % 3600) / 60)
              .toString()
              .padStart(2, "0");
            const secs = (time % 60).toString().padStart(2, "0");
            return `${hours}:${minutes}:${secs}`;
          })()}
        </span>
        <div className="space-x-2">
          <Button onClick={() => setIsRunning((prev) => !prev)}>
            {isRunning ? "Pause" : "Start"}
          </Button>
          <Button onClick={saveTimerEvent}>Stop &amp; Save</Button>
          <Button onClick={() => setTime(0)}>Reset Time</Button>
        </div>
        <div className="mt-4">
          <Label className="block text-sm">Proyecto:</Label>
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar proyecto" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.name}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {selectedProject && (
          <div className="flex justify-start mt-2 space-x-2">
            <Button
              onClick={() => deleteProject(selectedProject)}
              className="bg-red-500 text-white hover:bg-red-700 text-sm"
            >
              Eliminar Proyecto
            </Button>
            <Button
              onClick={() => {
                const proj = projects.find(
                  (p) => p.name === selectedProject
                );
                setUpdateProjectColor(proj?.color || "#aa69b9");
                setUpdateProjectRate(0);
                setIsUpdateProjectModalOpen(true);
              }}
              className="bg-blue-500 text-white hover:bg-blue-700 text-sm"
            >
              Actualizar
            </Button>
          </div>
        )}
        <div className="mt-4">
          <Label className="block text-sm">
            Descripción de la tarea (Opcional):
          </Label>
          <Textarea
            placeholder="Describe tu tarea..."
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
          />
        </div>
        <Button
          onClick={() => setIsProjectModalOpen(true)}
          className="w-full mt-4"
        >
          Crear Nuevo Proyecto
        </Button>
      </div>
      {/* Contenedor del calendario: altura fija de 1500px sin scroll */}
      <div
        className="relative w-full"
        style={{ overflow: "hidden", height: `${calendarContainerHeight}px` }}
      >
        <FullCalendar
          key={calendarKey}
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          height={calendarContainerHeight}
          editable={true}
          selectable
          select={handleSelect}
          // Combina los eventos del backend con el dummy event
          events={dummyEvent ? [...events, dummyEvent] : events}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
          eventResize={handleEventResize}
          eventClassNames={({ event }) => {
            if (event.id === "dummy-timer-event") {
              return "hidden"; // Ocultamos el evento real
            }
            return "border-accent text-primary-foreground";
          }}
          eventDidMount={(info) => {
            // **1️⃣ Aplicar color a eventos NORMALES**
            if (info.event.id !== "dummy-timer-event") {
              const project = projects.find((p) => p.name === info.event.extendedProps.project);
              const color = project ? project.color : "#999999"; // Color por defecto
          
              info.el.style.backgroundColor = color;
              info.el.style.borderColor = color;
              info.el.style.color = "white"; // Asegurar que el texto sea legible
              return; // Salimos aquí para evitar que se mezcle con el dummy event
            }
          
            // **2️⃣ Modificar SOLO el dummy-timer-event**
            if (info.event.id === "dummy-timer-event") {
              const container = document.createElement("div");
              container.className = "absolute flex items-center w-full";
              container.style.top = "50%"; // Centrar verticalmente
              container.style.left = "0"; // Asegurar alineación correcta
              container.style.transform = "translateY(-50%)"; // Ajuste fino
          
              // **Botón de inicio del temporizador**
              const button = document.createElement("button");
              button.innerHTML = "▶";
              button.className =
                "w-6 h-6 rounded-full border border-white bg-black text-white flex items-center justify-center shadow-md transition hover:bg-gray-800";
              
              // **🚨 Evitar que FullCalendar reciba el clic**
              button.addEventListener("mousedown", (event) => {
                event.stopPropagation(); // Detiene la propagación
                event.preventDefault(); // Previene comportamientos no deseados
              });
          
              button.addEventListener("click", (event) => {
                event.stopPropagation();
                setShowTimerModal(true);
              });
          
              // **Línea visual del botón**
              const line = document.createElement("div");
              line.className = "h-[2px] bg-white ml-2 flex-1";
              line.style.width = "100%";
          
              // **Agregar elementos al contenedor**
              container.appendChild(button);
              container.appendChild(line);
          
              // **Insertar el botón en la celda del evento**
              const parent = info.el.parentElement;
              if (parent) {
                parent.style.position = "relative"; // Asegurar que el botón se posicione bien
                parent.appendChild(container);
              }
            }
          }}
          



        />
      </div>
      {selectedEvent && selectedEvent.id !== "dummy-timer-event" && (
        <div className="p-6 bg-black rounded-lg shadow-lg mt-6">
          <h2 className="text-lg font-bold">Detalles del Evento</h2>
          <p>
            <strong>Proyecto:</strong> {selectedEvent.extendedProps?.project}
          </p>
          <p>
            <strong>Duración:</strong>{" "}
            {selectedEvent.extendedProps?.duracion}
          </p>
          <p>
            <strong>Descripción:</strong>{" "}
            {selectedEvent.extendedProps?.descripcion || "Sin descripción"}
          </p>
          <div className="flex justify-between mt-4">
            <Button onClick={() => setSelectedEvent(null)}>Cerrar</Button>
            <Button
              onClick={() => deleteEvent(selectedEvent.id)}
              className="bg-red-500 text-white hover:bg-red-700"
            >
              Eliminar Evento
            </Button>
          </div>
        </div>
      )}
      <Dialog.Root
        open={isProjectModalOpen}
        onOpenChange={setIsProjectModalOpen}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[48]" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black rounded-lg p-6 w-[95vw] max-w-md z-[49]">
            <Dialog.Title className="text-lg font-bold mb-4">
              Crear Nuevo Proyecto
            </Dialog.Title>
            <div className="space-y-4">
              <div>
                <Label>Nombre del Proyecto</Label>
                <Input
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Ingrese el nombre del proyecto"
                />
              </div>
              <div>
                <Label>Tarifa por Hora</Label>
                <Input
                  type="number"
                  value={hourlyRate !== null ? hourlyRate : ""}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  placeholder="Ingrese su tarifa por hora"
                />
              </div>
              <div>
                <Label>Color del Proyecto</Label>
                <Input
                  type="color"
                  value={newProjectColor}
                  onChange={(e) => setNewProjectColor(e.target.value)}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsProjectModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={createProject} disabled={isCreatingProject}>
                  {isCreatingProject ? "Creando..." : "Crear Proyecto"}
                </Button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <Dialog.Root
        open={isUpdateProjectModalOpen}
        onOpenChange={setIsUpdateProjectModalOpen}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[48]" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black rounded-lg p-6 w-[95vw] max-w-md z-[49]">
            <Dialog.Title className="text-lg font-bold mb-4">
              Actualizar Proyecto
            </Dialog.Title>
            <div className="space-y-4">
              <div>
                <Label>Nuevo Color</Label>
                <Input
                  type="color"
                  value={updateProjectColor}
                  onChange={(e) => setUpdateProjectColor(e.target.value)}
                />
              </div>
              <div>
                <Label>Nueva Tarifa por Hora</Label>
                <Input
                  type="number"
                  value={updateProjectRate !== null ? updateProjectRate : ""}
                  onChange={(e) => setUpdateProjectRate(Number(e.target.value))}
                  placeholder="Ingrese tarifa por hora"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Dialog.Close asChild>
                  <Button variant="outline">Cancelar</Button>
                </Dialog.Close>
                <Button onClick={updateProject}>Actualizar</Button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <AddEventModal
        isOpen={newEvent !== null}
        onClose={() => setNewEvent(null)}
        newEvent={newEvent}
        setNewEvent={setNewEvent}
        onSave={saveNewEvent}
        projects={projects}
      />
      <TimerEventModal
        isOpen={showTimerModal}
        onClose={() => setShowTimerModal(false)}
        onSave={handleTimerModalSave}
        projects={projects}
        selectedProject={selectedProject}
        setSelectedProject={setSelectedProject}
        taskDescription={taskDescription}
        setTaskDescription={setTaskDescription}
      />
    </div>
  );
}
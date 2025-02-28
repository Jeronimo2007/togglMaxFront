"use client"

import React, { useRef, useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import type { EventApi } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import * as Dialog from "@radix-ui/react-dialog";
import type { DateSelectArg } from "@fullcalendar/core";
import { EventClickArg } from "@fullcalendar/core";

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

interface Event {
  id: string;
  title: string;
  start: string;
  end: string;
  display: string;
  allDay: boolean;
  editable: boolean; // set true so that the event can be dragged/resized
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

// Modal para agregar evento
const AddEventModal: React.FC<AddEventModalProps> = ({
  isOpen,
  onClose,
  newEvent,
  setNewEvent,
  onSave,
  projects
}) => {
  const adjustTimeZone = (date: Date): string => {
    if (!date) return '';
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
                value={newEvent?.start ? adjustTimeZone(newEvent.start) : ''}
                onChange={(e) => {
                  const date = new Date(e.target.value);
                  if (!isNaN(date.getTime())) {
                    setNewEvent({
                      ...newEvent!,
                      start: date,
                      end: newEvent?.end || new Date(date.getTime() + 3600000)
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
                value={newEvent?.end ? adjustTimeZone(newEvent.end) : ''}
                onChange={(e) => {
                  const date = new Date(e.target.value);
                  if (!isNaN(date.getTime())) {
                    setNewEvent({
                      ...newEvent!,
                      end: date
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
                  setNewEvent({ ...newEvent!, descripcion: e.target.value })
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

// Modal para iniciar el timer desde el marcador de "now"
interface NowTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: string, description: string) => void;
  projects: Project[];
}

const NowTimerModal: React.FC<NowTimerModalProps> = ({ isOpen, onClose, onSave, projects }) => {
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[48]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black rounded-lg p-6 w-[95vw] max-w-md max-h-[85vh] overflow-y-auto z-[49]">
          <Dialog.Title className="text-lg font-bold mb-4">
            Iniciar Timer Ahora
          </Dialog.Title>
          <div className="space-y-4">
            <div>
              <Label>Proyecto</Label>
              <Select
                value={selectedProject}
                onValueChange={(value) => setSelectedProject(value)}
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
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Agrega una descripción"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Dialog.Close asChild>
                <Button variant="outline">Cancelar</Button>
              </Dialog.Close>
              <Button
                onClick={() => {
                  onSave(selectedProject, description);
                  setSelectedProject("");
                  setDescription("");
                }}
              >
                Guardar y Empezar
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default function Home() {
  const calendarRef = useRef<FullCalendar>(null);
  const [time, setTime] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [taskDescription, setTaskDescription] = useState<string>("");
  const [events, setEvents] = useState<Event[]>([]);
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

  // Estado para el marcador de "now"
  const [now, setNow] = useState<Date>(new Date());
  // Estado para el now marker solo en el día actual
  const [isNowModalOpen, setIsNowModalOpen] = useState<boolean>(false);
  // Estados para calcular el left offset y width de la columna del día actual
  const [nowLeftOffset, setNowLeftOffset] = useState<number>(0);
  const [dayColumnWidth, setDayColumnWidth] = useState<number>(0);

  const calendarContainerHeight = 500; // px, altura mínima del contenedor

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Actualizar el estado de "now" cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Calcular el top offset basado en la hora actual
  const minutesSinceMidnight =
    now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
  const nowTopOffset = (minutesSinceMidnight / 1440) * calendarContainerHeight;

  // Calcular el left offset y width para la columna del día actual
  useEffect(() => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      const view = calendarApi.view;
      // view.activeStart is the first date of the current view (week/day)
      const viewStart = view.activeStart;
      // Diferencia en días entre "now" y el inicio de la vista
      const diffTime = now.getTime() - viewStart.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      // Solo si diffDays está entre 0 y 6, entonces "now" está en la semana actual
      if (diffDays >= 0 && diffDays < 7) {
        // Accede al contenedor del calendario utilizando cast a any para obtener la propiedad 'el'
        const calendarEl = (calendarRef.current as any).el as HTMLElement;
        const containerWidth = calendarEl ? calendarEl.getBoundingClientRect().width : 0;
        const widthPerDay = containerWidth / 7;
        setNowLeftOffset(diffDays * widthPerDay);
        setDayColumnWidth(widthPerDay);
      } else {
        setNowLeftOffset(0);
        setDayColumnWidth(0);
      }
    }
  }, [now, calendarKey]);

  // Funciones para borrar, actualizar, crear proyectos y eventos...
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
      const newEnd: Date =
        info.event.end || new Date(newStart.getTime() + 3600000);
      
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
        alert(
          errorData.detail || "Error al actualizar las fechas del evento"
        );
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

  const handleNowMarkerClick = () => {
    setIsNowModalOpen(true);
  };

  const handleNowModalSave = (project: string, description: string) => {
    setSelectedProject(project);
    setTaskDescription(description);
    setIsRunning(true);
    setIsNowModalOpen(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="p-6 bg-gray-800 text-white rounded-lg space-y-4">
        <h2 className="text-lg font-bold">Temporizador</h2>
        <span className="text-2xl">{formatTime(time)}</span>
        <div className="space-x-2">
          <Button onClick={() => setIsRunning(!isRunning)}>
            {isRunning ? "Pause" : "Start"}
          </Button>
          <Button onClick={saveTimerEvent}>Stop & Save</Button>
          <Button onClick={() => setTime(0)}>Reset Time</Button>
        </div>
        <div className="mt-4">
          <label className="block text-sm">Proyecto:</label>
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
                const proj = projects.find((p) => p.name === selectedProject);
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
          <label className="block text-sm">
            Descripción de la tarea (Opcional):
          </label>
          <Textarea
            placeholder="Describe tu tarea..."
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
          />
        </div>
        <Button onClick={() => setIsProjectModalOpen(true)} className="w-full mt-4">
          Crear Nuevo Proyecto
        </Button>
      </div>
      <div
        className="resizable-calendar-container relative"
        style={{
          resize: "vertical",
          overflow: "hidden",
          minHeight: `${calendarContainerHeight}px`
        }}
      >
        <FullCalendar
          key={calendarKey}
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay"
          }}
          editable={true}
          selectable
          select={handleSelect}
          events={events}
          dateClick={handleDateClick}
          eventClick={(info: EventClickArg) => setSelectedEvent(info.event)}
          eventDrop={handleEventDrop}
          eventResize={handleEventResize}
          eventClassNames={({ event }) => {
            const project = projects.find((p) => p.name === event.extendedProps.project);
            return project ? `border-accent text-primary-foreground` : "";
          }}
          eventDidMount={(info) => {
            const project = projects.find((p) => p.name === info.event.extendedProps.project);
            const color = project ? project.color : "#999999";
            info.el.style.backgroundColor = color;
            info.el.style.borderColor = color;
          }}
        />
        {/* Now Marker: Solo se mostrará la línea y botón en el día actual */}
        {dayColumnWidth > 0 && (
          <div
            style={{
              position: "absolute",
              top: `${nowTopOffset}px`,
              left: `${nowLeftOffset}px`,
              width: `${dayColumnWidth}px`,
              pointerEvents: "none",
              zIndex: 1100 // Z index aumentado para asegurar que se muestre por encima de otros elementos
            }}
          >
            <div style={{ position: "relative", borderTop: "2px solid white" }}>
              <button
                onClick={handleNowMarkerClick}
                style={{
                  position: "absolute",
                  left: 0,
                  top: -10,
                  pointerEvents: "auto",
                  background: "white",
                  border: "none",
                  borderRadius: "50%",
                  width: "20px",
                  height: "20px",
                  cursor: "pointer",
                  zIndex: 1200 // Z index para el botón aún más alto
                }}
                title="Iniciar timer"
              ></button>
            </div>
          </div>
        )}
      </div>
      {selectedEvent && (
        <div className="p-6 bg-black rounded-lg shadow-lg mt-6">
          <h2 className="text-lg font-bold">Detalles del Evento</h2>
          <p>
            <strong>Proyecto:</strong> {selectedEvent.extendedProps?.project}
          </p>
          <p>
            <strong>Duración:</strong> {selectedEvent.extendedProps?.duracion}
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
      <Dialog.Root open={isProjectModalOpen} onOpenChange={setIsProjectModalOpen}>
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
                <Button variant="outline" onClick={() => setIsProjectModalOpen(false)}>
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
      <Dialog.Root open={isUpdateProjectModalOpen} onOpenChange={setIsUpdateProjectModalOpen}>
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
      <NowTimerModal
        isOpen={isNowModalOpen}
        onClose={() => setIsNowModalOpen(false)}
        onSave={handleNowModalSave}
        projects={projects}
      />
    </div>
  );
}
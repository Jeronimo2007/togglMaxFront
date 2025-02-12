"use client";
import { useRef, useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import * as Dialog from "@radix-ui/react-dialog";
import { DateClickArg } from '@fullcalendar/interaction';
import { EventClickArg } from '@fullcalendar/core';
//import "@/styles/fullcalenda.css"

interface Project {
  id: string;
  name: string;
}

interface NewEvent {
  start: Date;
  end: Date;
  project: string;
  descripcion: string;
}

interface Event {
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
    descripcion: string;
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

const AddEventModal: React.FC<AddEventModalProps> = ({ isOpen, onClose, newEvent, setNewEvent, onSave, projects }) => {
  const adjustTimeZone = (date: Date): string => {
    if (!date) return '';
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - userTimezoneOffset).toISOString().slice(0, 16);
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
                onValueChange={(value) => setNewEvent({...newEvent!, project: value})}
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
                value={newEvent?.descripcion}
                onChange={(e) => setNewEvent({...newEvent!, descripcion: e.target.value})}
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
  const [isCreatingProject, setIsCreatingProject] = useState(false);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/event/eventos/${eventId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        alert("Evento eliminado correctamente");
        setSelectedEvent(null);
        fetchEvents(); // Actualizar la lista de eventos
      } else {
        const errorData = await response.json();
        alert(errorData.detail || "Error al eliminar el evento");
      }
    } catch (error) {
      console.error("Error al eliminar el evento:", error);
      alert("Error de conexión al servidor");
    }
  };

  const createProject = async () => {
    if (!newProjectName.trim()) {
      alert("Por favor ingrese un nombre de proyecto");
      return;
    }


    setIsCreatingProject(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/project/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          project_name: newProjectName
        })
      });

      if (!response.ok) {
        throw new Error('Error al crear el proyecto');
      }

      await fetchProjects();
      setNewProjectName("");
      setIsProjectModalOpen(false);
      alert("Proyecto creado exitosamente");
    } catch (error) {
      console.error('Error:', error);
      alert('Error al crear el proyecto');
    } finally {
      setIsCreatingProject(false);
    }
  };

  const fetchProjects = async (): Promise<void> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/project/get`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await response.json();
      if (data.status === "success") {
        setProjects(data.data);
      }
    } catch (error) {
      console.error("Error al obtener proyectos:", error);
    }
  };

  const fetchEvents = async (): Promise<void> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/event/eventos/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await response.json();
      if (data.status === "success") {
        const formattedEvents = data.data.map((event: any) => ({
          id: event.id,
          title: event.descripcion,
          start: new Date(event.fecha_inicio).toISOString(),
          end: new Date(event.fecha_fin).toISOString(),
          display: "block",
          allDay: false,
          editable: false,
          durationEditable: false,
          eventResizableFromStart: false,
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
      if (document.visibilityState === 'visible') {
        fetchEvents();
      }
    };

    const handleFocus = () => {
      fetchEvents();
    };

    // Cargar datos iniciales
    fetchProjects();
    fetchEvents();

    // Agregar event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
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

  const saveNewEvent = async (): Promise<void> => {
    if (!newEvent?.project || !newEvent?.descripcion?.trim()) {
      alert("Por favor, completa todos los campos");
      return;
    }

    if (newEvent.end <= newEvent.start) {
      alert("La fecha de fin debe ser posterior a la fecha de inicio");
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/event/eventos/manual/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          project: newEvent.project,
          descripcion: newEvent.descripcion,
          fecha_inicio: newEvent.start.toISOString(),
          fecha_fin: newEvent.end.toISOString(),
        }),
      });

      if (response.ok) {
        alert("Evento guardado correctamente");
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
    if (!selectedProject || !taskDescription.trim()) {
      alert("Por favor, selecciona un proyecto y añade una descripción");
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/event/eventos/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          project: selectedProject,
          descripcion: taskDescription,
          duracion: time,
        }),
      });

      if (response.ok) {
        alert("Evento guardado correctamente");
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

        <div className="mt-4">
          <label className="block text-sm">Descripción de la tarea:</label>
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

      
        
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        editable={false}
        selectable
        height="500px"
        events={events}
        dateClick={handleDateClick}
        eventClick={(info: EventClickArg) => setSelectedEvent(info.event)}
      />
    

      {selectedEvent && (
        <div className="p-6 bg-black rounded-lg shadow-lg mt-6">
          <h2 className="text-lg font-bold">Detalles del Evento</h2>
          <p><strong>Proyecto:</strong> {selectedEvent.extendedProps?.project}</p>
          <p><strong>Duración:</strong> {selectedEvent.extendedProps?.duracion}</p>
          <p><strong>Descripción:</strong> {selectedEvent.extendedProps?.descripcion}</p>
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

      <AddEventModal
        isOpen={newEvent !== null}
        onClose={() => setNewEvent(null)}
        newEvent={newEvent}
        setNewEvent={setNewEvent}
        onSave={saveNewEvent}
        projects={projects}
      />
    </div>
  );
}
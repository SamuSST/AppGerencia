import { MapPin, Clock, FileText, Image as ImageIcon } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router";
import { Card } from "./ui/card";
import { CheckInButton } from "./CheckInButton";
import { getVisitsByVendedor, type Visit } from "../data/mockVisits";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { toast } from "sonner";

const STORAGE_KEY = "vendor_visits";

export function DailyRoute() {
  const { vendedorId } = useParams();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const today = new Date().toISOString().split("T")[0];
  const timelineRef = useRef<HTMLDivElement>(null);

  // Cargar visitas al montar el componente
  useEffect(() => {
    if (vendedorId) {
      // Obtener visitas mock
      const mockVisits = getVisitsByVendedor(Number(vendedorId), today);

      // Obtener visitas guardadas del localStorage
      const savedVisitsJSON = localStorage.getItem(STORAGE_KEY);
      let savedVisits: Visit[] = [];

      if (savedVisitsJSON) {
        try {
          const allSavedVisits = JSON.parse(savedVisitsJSON) as Visit[];
          // Filtrar por vendedor y fecha actual
          savedVisits = allSavedVisits.filter(
            v => v.vendedorId === Number(vendedorId) && v.fecha === today
          );
        } catch (error) {
          console.error("Error al cargar visitas guardadas:", error);
        }
      }

      // Combinar visitas mock y guardadas, ordenadas por hora
      const allVisits = [...mockVisits, ...savedVisits].sort((a, b) =>
        a.hora.localeCompare(b.hora)
      );

      setVisits(allVisits);
    }
  }, [vendedorId, today]);

  const handleCheckIn = (
    ubicacion: { lat: number; lng: number; direccion: string },
    foto?: string,
    notas?: string
  ) => {
    const newVisit: Visit = {
      id: Date.now(),
      vendedorId: Number(vendedorId),
      fecha: today,
      hora: new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }),
      ubicacion,
      foto,
      notas
    };

    // Actualizar estado local
    const updatedVisits = [...visits, newVisit].sort((a, b) => a.hora.localeCompare(b.hora));
    setVisits(updatedVisits);

    // Guardar en localStorage
    try {
      const savedVisitsJSON = localStorage.getItem(STORAGE_KEY);
      let allSavedVisits: Visit[] = [];

      if (savedVisitsJSON) {
        allSavedVisits = JSON.parse(savedVisitsJSON);
      }

      // Agregar la nueva visita
      allSavedVisits.push(newVisit);

      // Guardar de vuelta en localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allSavedVisits));

      toast.success("Visita registrada correctamente");

      // Scroll suave al timeline después de un breve delay
      setTimeout(() => {
        timelineRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 100);
    } catch (error) {
      console.error("Error al guardar la visita:", error);
      toast.error("La visita se registró pero no se pudo guardar");
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6 max-w-7xl mx-auto">
      {/* Header del recorrido */}
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center gap-3 mb-3">
          <MapPin className="w-8 h-8" />
          <div>
            <h2 className="text-2xl font-bold">Recorrido Diario</h2>
            <p className="text-green-100 text-sm">Registra tus visitas con ubicación GPS</p>
          </div>
        </div>

        {/* Resumen del día */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <div className="bg-green-600/30 rounded-lg p-3 backdrop-blur-sm">
            <p className="text-xs text-green-100 mb-1">Visitas de hoy</p>
            <p className="text-2xl font-bold">{visits.length}</p>
          </div>
          <div className="bg-green-600/30 rounded-lg p-3 backdrop-blur-sm">
            <p className="text-xs text-green-100 mb-1">Última visita</p>
            <p className="text-2xl font-bold">
              {visits.length > 0 ? visits[visits.length - 1].hora : "--:--"}
            </p>
          </div>
          <div className="bg-green-600/30 rounded-lg p-3 backdrop-blur-sm">
            <p className="text-xs text-green-100 mb-1">Con foto</p>
            <p className="text-2xl font-bold">
              {visits.filter(v => v.foto).length}
            </p>
          </div>
          <div className="bg-green-600/30 rounded-lg p-3 backdrop-blur-sm">
            <p className="text-xs text-green-100 mb-1">Con notas</p>
            <p className="text-2xl font-bold">
              {visits.filter(v => v.notas).length}
            </p>
          </div>
        </div>
      </div>

      {/* Botón de check-in */}
      <CheckInButton vendedorId={Number(vendedorId)} onCheckIn={handleCheckIn} />

      {/* Timeline de visitas */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          Timeline de Visitas
        </h3>
        {visits.length === 0 ? (
          <Card className="p-8 text-center">
            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Aún no has registrado visitas hoy</p>
            <p className="text-sm text-gray-400 mt-1">Usa el botón de "Registrar Visita" para comenzar</p>
          </Card>
        ) : (
          <div ref={timelineRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visits.map((visit, index) => (
            <Card
              key={visit.id}
              className="p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedVisit(visit)}
            >
              <div className="flex gap-4">
                {/* Timeline indicator */}
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  {index < visits.length - 1 && (
                    <div className="w-0.5 h-full bg-blue-300 mt-2" />
                  )}
                </div>

                {/* Contenido */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="font-bold text-gray-900">{visit.hora}</span>
                  </div>

                  <div className="flex items-start gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                    <span className="text-sm text-gray-700">{visit.ubicacion.direccion}</span>
                  </div>

                  {visit.notas && (
                    <div className="flex items-start gap-2 mb-2">
                      <FileText className="w-4 h-4 text-gray-500 mt-0.5" />
                      <span className="text-sm text-gray-600 italic">{visit.notas}</span>
                    </div>
                  )}

                  {visit.foto && (
                    <div className="mt-3 rounded-lg overflow-hidden">
                      <img
                        src={visit.foto}
                        alt={`Visita ${index + 1}`}
                        className="w-full h-32 object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
          </div>
        )}
      </div>

      {/* Modal de detalles */}
      <Dialog open={!!selectedVisit} onOpenChange={() => setSelectedVisit(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalles de la Visita</DialogTitle>
          </DialogHeader>
          {selectedVisit && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Hora</p>
                <p className="font-bold">{selectedVisit.hora}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Ubicación</p>
                <p className="text-sm">{selectedVisit.ubicacion.direccion}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Lat: {selectedVisit.ubicacion.lat.toFixed(6)}, Lng: {selectedVisit.ubicacion.lng.toFixed(6)}
                </p>
              </div>

              {selectedVisit.notas && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Notas</p>
                  <p className="text-sm">{selectedVisit.notas}</p>
                </div>
              )}

              {selectedVisit.foto && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Foto</p>
                  <img
                    src={selectedVisit.foto}
                    alt="Foto de la visita"
                    className="w-full rounded-lg"
                  />
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

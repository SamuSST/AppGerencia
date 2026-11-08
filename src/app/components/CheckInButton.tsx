import { MapPin, Camera, Upload } from "lucide-react";
import { useState, useRef } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { toast } from "sonner";

interface CheckInButtonProps {
  vendedorId: number;
  onCheckIn: (ubicacion: { lat: number; lng: number; direccion: string }, foto?: string, notas?: string) => void;
}

export function CheckInButton({ vendedorId, onCheckIn }: CheckInButtonProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [notas, setNotas] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGetLocation = () => {
    setIsCapturing(true);

    if (!navigator.geolocation) {
      toast.error("Tu navegador no soporta geolocalización");
      setIsCapturing(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Simulamos la geocodificación inversa (en producción usar una API real)
        const direccion = `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`;

        toast.success("Ubicación capturada correctamente");

        onCheckIn(
          { lat: latitude, lng: longitude, direccion },
          capturedPhoto || undefined,
          notas || undefined
        );

        // Reset
        setCapturedPhoto(null);
        setNotas("");
        setIsCapturing(false);
      },
      (error) => {
        let errorMessage = "No se pudo obtener la ubicación";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Debes permitir el acceso a tu ubicación en la configuración del navegador";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "No se puede determinar tu ubicación en este momento";
            break;
          case error.TIMEOUT:
            errorMessage = "Se agotó el tiempo de espera para obtener la ubicación";
            break;
        }

        toast.error(errorMessage);
        setIsCapturing(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedPhoto(reader.result as string);
        toast.success("Foto capturada");
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card className="p-5 bg-white border-2 border-green-200 shadow-lg hover:shadow-xl transition-shadow">
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900">Nueva Visita</h3>
            <p className="text-sm text-gray-600">Registra ubicación GPS y evidencia fotográfica</p>
          </div>
        </div>

        {/* Botón para tomar foto */}
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoCapture}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            className="flex-1 gap-2"
            disabled={isCapturing}
          >
            <Camera className="w-4 h-4" />
            {capturedPhoto ? "Cambiar foto" : "Tomar foto"}
          </Button>
        </div>

        {/* Preview de la foto */}
        {capturedPhoto && (
          <div className="relative rounded-lg overflow-hidden">
            <img src={capturedPhoto} alt="Foto capturada" className="w-full h-40 object-cover" />
            <button
              onClick={() => setCapturedPhoto(null)}
              className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
            >
              ✕
            </button>
          </div>
        )}

        {/* Notas opcionales */}
        <textarea
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          placeholder="Notas de la visita (opcional)"
          className="w-full p-3 border rounded-lg resize-none"
          rows={2}
        />

        {/* Botón de check-in */}
        <Button
          onClick={handleGetLocation}
          disabled={isCapturing}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white gap-2 h-12 text-base font-semibold shadow-md"
        >
          <Upload className="w-5 h-5" />
          {isCapturing ? "Obteniendo ubicación..." : "Registrar Visita Ahora"}
        </Button>
      </div>
    </Card>
  );
}

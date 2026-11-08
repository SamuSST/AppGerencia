import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import { Badge } from "./ui/badge";
import { Car, Bike, Truck, Calendar } from "lucide-react";

interface Client {
  id: number;
  nombre: string;
  vehiculo: string;
  placa: string;
  tipoVehiculo: "carro" | "moto" | "pesado";
  tipoServicio: "publico" | "particular";
  fecha: string;
}

interface ClientDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  clients: Client[];
}

const vehicleIcons = {
  carro: Car,
  moto: Bike,
  pesado: Truck,
};

export function ClientDetailsSheet({ open, onOpenChange, title, clients }: ClientDetailsSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[80vh] max-w-md mx-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>{title}</span>
            <Badge variant="secondary">{clients.length} clientes</Badge>
          </SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-3 overflow-y-auto max-h-[calc(80vh-100px)] pb-6">
          {clients.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No hay clientes en esta categoría</p>
            </div>
          ) : (
            clients.map((client) => {
              const VehicleIcon = vehicleIcons[client.tipoVehiculo];
              
              return (
                <div key={client.id} className="border rounded-lg p-4 bg-white">
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      client.tipoVehiculo === 'carro' ? 'bg-blue-100' :
                      client.tipoVehiculo === 'moto' ? 'bg-green-100' :
                      'bg-orange-100'
                    }`}>
                      <VehicleIcon className={`w-6 h-6 ${
                        client.tipoVehiculo === 'carro' ? 'text-blue-600' :
                        client.tipoVehiculo === 'moto' ? 'text-green-600' :
                        'text-orange-600'
                      }`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <p className="font-semibold text-gray-900">{client.nombre}</p>
                          <p className="text-sm text-gray-600">{client.vehiculo}</p>
                        </div>
                        <Badge 
                          variant={client.tipoServicio === "publico" ? "default" : "secondary"}
                          className="shrink-0"
                        >
                          {client.tipoServicio === "publico" ? "Público" : "Particular"}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <span className="font-mono text-gray-700 bg-gray-100 px-2 py-1 rounded">
                          {client.placa}
                        </span>
                        <div className="flex items-center gap-1 text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(client.fecha).toLocaleDateString('es-CO', { 
                            day: 'numeric', 
                            month: 'short',
                            year: 'numeric'
                          })}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

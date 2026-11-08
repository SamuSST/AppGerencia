import { Badge } from "./ui/badge";
import { Car, Bike, Truck } from "lucide-react";

interface Client {
  id: number;
  nombre: string;
  vehiculo: string;
  placa: string;
  tipoVehiculo: "carro" | "moto" | "pesado";
  tipoServicio: "publico" | "particular";
  fecha: string;
}

const recentClients: Client[] = [
  {
    id: 1,
    nombre: "Carlos Rodríguez",
    vehiculo: "Toyota Corolla",
    placa: "ABC-123",
    tipoVehiculo: "carro",
    tipoServicio: "particular",
    fecha: "2026-03-09",
  },
  {
    id: 2,
    nombre: "María González",
    vehiculo: "Suzuki GS150",
    placa: "XYZ-789",
    tipoVehiculo: "moto",
    tipoServicio: "particular",
    fecha: "2026-03-09",
  },
  {
    id: 3,
    nombre: "TransCarga S.A.",
    vehiculo: "Chevrolet NPR",
    placa: "TRK-456",
    tipoVehiculo: "pesado",
    tipoServicio: "publico",
    fecha: "2026-03-08",
  },
  {
    id: 4,
    nombre: "Luis Martínez",
    vehiculo: "Mazda 3",
    placa: "DEF-321",
    tipoVehiculo: "carro",
    tipoServicio: "particular",
    fecha: "2026-03-08",
  },
  {
    id: 5,
    nombre: "Taxi Express",
    vehiculo: "Renault Logan",
    placa: "TAX-654",
    tipoVehiculo: "carro",
    tipoServicio: "publico",
    fecha: "2026-03-07",
  },
];

const vehicleIcons = {
  carro: Car,
  moto: Bike,
  pesado: Truck,
};

export function ClientList() {
  return (
    <div className="bg-white rounded-xl shadow-md p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Clientes Recientes</h3>
        <Badge variant="secondary" className="text-xs">{recentClients.length}</Badge>
      </div>
      
      <div className="space-y-3">
        {recentClients.map((client) => {
          const VehicleIcon = vehicleIcons[client.tipoVehiculo];
          
          return (
            <div key={client.id} className="border rounded-lg p-3">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  client.tipoVehiculo === 'carro' ? 'bg-blue-100' :
                  client.tipoVehiculo === 'moto' ? 'bg-green-100' :
                  'bg-orange-100'
                }`}>
                  <VehicleIcon className={`w-5 h-5 ${
                    client.tipoVehiculo === 'carro' ? 'text-blue-600' :
                    client.tipoVehiculo === 'moto' ? 'text-green-600' :
                    'text-orange-600'
                  }`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{client.nombre}</p>
                      <p className="text-xs text-gray-600">{client.vehiculo}</p>
                    </div>
                    <Badge 
                      variant={client.tipoServicio === "publico" ? "default" : "secondary"}
                      className="text-xs shrink-0"
                    >
                      {client.tipoServicio === "publico" ? "Público" : "Particular"}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs font-mono text-gray-700">{client.placa}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(client.fecha).toLocaleDateString('es-CO', { 
                        day: 'numeric', 
                        month: 'short' 
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
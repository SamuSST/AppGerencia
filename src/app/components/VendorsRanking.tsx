import { Trophy, TrendingUp, AlertTriangle } from "lucide-react";
import { Progress } from "./ui/progress";

interface Vendor {
  id: number;
  nombre: string;
  clientes: number;
  meta: number;
  porcentaje: number;
  posicion: number;
  estado: "excelente" | "moderado" | "critico";
}

const vendedores: Vendor[] = [
  {
    id: 1,
    nombre: "María Rodríguez",
    clientes: 58,
    meta: 50,
    porcentaje: 116,
    posicion: 1,
    estado: "excelente"
  },
  {
    id: 2,
    nombre: "Carlos Mendoza",
    clientes: 52,
    meta: 50,
    porcentaje: 104,
    posicion: 2,
    estado: "excelente"
  },
  {
    id: 3,
    nombre: "Juan Pérez",
    clientes: 42,
    meta: 50,
    porcentaje: 84,
    posicion: 3,
    estado: "excelente"
  },
  {
    id: 4,
    nombre: "Ana García",
    clientes: 38,
    meta: 50,
    porcentaje: 76,
    posicion: 4,
    estado: "moderado"
  },
  {
    id: 5,
    nombre: "Luis Martínez",
    clientes: 35,
    meta: 50,
    porcentaje: 70,
    posicion: 5,
    estado: "moderado"
  },
  {
    id: 6,
    nombre: "Diana Sánchez",
    clientes: 28,
    meta: 50,
    porcentaje: 56,
    posicion: 6,
    estado: "moderado"
  },
  {
    id: 7,
    nombre: "Pedro López",
    clientes: 22,
    meta: 50,
    porcentaje: 44,
    posicion: 7,
    estado: "critico"
  },
  {
    id: 8,
    nombre: "Sofía Ramírez",
    clientes: 18,
    meta: 50,
    porcentaje: 36,
    posicion: 8,
    estado: "critico"
  },
];

const getEstadoColor = (estado: Vendor["estado"]) => {
  switch (estado) {
    case "excelente":
      return {
        bg: "bg-green-50",
        border: "border-green-200",
        text: "text-green-700",
        icon: "bg-green-500",
        progress: "bg-green-500"
      };
    case "moderado":
      return {
        bg: "bg-orange-50",
        border: "border-orange-200",
        text: "text-orange-700",
        icon: "bg-orange-500",
        progress: "bg-orange-500"
      };
    case "critico":
      return {
        bg: "bg-red-50",
        border: "border-red-200",
        text: "text-red-700",
        icon: "bg-red-500",
        progress: "bg-red-500"
      };
  }
};

const getEstadoIcon = (estado: Vendor["estado"]) => {
  switch (estado) {
    case "excelente":
      return TrendingUp;
    case "moderado":
      return AlertTriangle;
    case "critico":
      return AlertTriangle;
  }
};

const getEstadoTexto = (estado: Vendor["estado"]) => {
  switch (estado) {
    case "excelente":
      return "Excelente";
    case "moderado":
      return "Moderado";
    case "critico":
      return "Crítico";
  }
};

export function VendorsRanking() {
  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-4 max-w-7xl mx-auto pb-8 md:pb-4">
      {/* Header */}
      <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Trophy className="w-8 h-8" />
          <h2 className="text-xl font-bold">Ranking de Vendedores</h2>
        </div>
        <p className="text-sm text-yellow-50">Marzo 2026 - Rendimiento del equipo</p>
      </div>

      {/* Leyenda */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Indicadores</h3>
        <div className="grid grid-cols-3 gap-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-xs text-gray-700">≥75%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span className="text-xs text-gray-700">50-74%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-xs text-gray-700">&lt;50%</span>
          </div>
        </div>
      </div>

      {/* Lista de vendedores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vendedores.map((vendedor) => {
          const colors = getEstadoColor(vendedor.estado);
          const IconEstado = getEstadoIcon(vendedor.estado);
          const isCurrentUser = vendedor.nombre === "Juan Pérez";

          return (
            <div
              key={vendedor.id}
              className={`bg-white rounded-xl shadow-md overflow-hidden border-2 ${
                isCurrentUser ? 'border-blue-500 ring-2 ring-blue-200' : 'border-transparent'
              }`}
            >
              <div className={`${colors.bg} border-b ${colors.border} p-3`}>
                <div className="flex items-center gap-3">
                  {/* Posición */}
                  <div className={`w-10 h-10 rounded-lg ${colors.icon} flex items-center justify-center`}>
                    {vendedor.posicion <= 3 ? (
                      <Trophy className="w-5 h-5 text-white" />
                    ) : (
                      <span className="text-white font-bold">#{vendedor.posicion}</span>
                    )}
                  </div>

                  {/* Info del vendedor */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-gray-900 truncate">
                        {vendedor.nombre}
                      </p>
                      {isCurrentUser && (
                        <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                          Tú
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <IconEstado className={`w-3.5 h-3.5 ${colors.text}`} />
                      <span className={`text-xs font-medium ${colors.text}`}>
                        {getEstadoTexto(vendedor.estado)}
                      </span>
                    </div>
                  </div>

                  {/* Porcentaje */}
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900">{vendedor.porcentaje}%</p>
                    <p className="text-xs text-gray-600">{vendedor.clientes}/{vendedor.meta}</p>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="p-3 bg-white">
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${colors.progress} transition-all duration-500`}
                    style={{ width: `${Math.min(vendedor.porcentaje, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

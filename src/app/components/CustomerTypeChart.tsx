import { Card } from "./ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Users } from "lucide-react";
import { allClients } from "../data/mockClients";
import { useId } from "react";

export function CustomerTypeChart() {
  const id = useId();
  // Agrupar por fecha y tipo de cliente
  const dateData = allClients.reduce((acc, client) => {
    const date = client.fecha;
    
    if (!acc[date]) {
      acc[date] = { recurrentes: 0, nuevos: 0 };
    }
    
    if (client.esRecurrente) {
      acc[date].recurrentes += 1;
    } else {
      acc[date].nuevos += 1;
    }
    
    return acc;
  }, {} as Record<string, { recurrentes: number; nuevos: number }>);

  // Convertir a array y ordenar por fecha
  const chartData = Object.entries(dateData)
    .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
    .slice(-7) // Últimos 7 días
    .map(([fecha, data]) => {
      const date = new Date(fecha);
      const day = date.getDate();
      const month = date.toLocaleDateString("es-ES", { month: "short" });
      
      return {
        fecha: `${day} ${month}`,
        recurrentes: data.recurrentes,
        nuevos: data.nuevos,
      };
    });

  const totalRecurrentes = chartData.reduce((sum, item) => sum + item.recurrentes, 0);
  const totalNuevos = chartData.reduce((sum, item) => sum + item.nuevos, 0);
  const porcentajeRecurrentes = Math.round((totalRecurrentes / (totalRecurrentes + totalNuevos)) * 100);

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Tipo de Clientes</h3>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Recurrencia</p>
          <p className="text-lg font-bold text-blue-600">{porcentajeRecurrentes}%</p>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id={`colorRecurrentes-${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id={`colorNuevos-${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="fecha" 
            tick={{ fontSize: 11 }}
            stroke="#6b7280"
          />
          <YAxis 
            tick={{ fontSize: 11 }}
            stroke="#6b7280"
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "#fff", 
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "12px"
            }}
          />
          <Legend 
            wrapperStyle={{ fontSize: "12px" }}
            formatter={(value) => value === "recurrentes" ? "Recurrentes" : "Nuevos"}
          />
          <Area
            type="monotone"
            dataKey="recurrentes"
            stroke="#3b82f6"
            fillOpacity={1}
            fill={`url(#colorRecurrentes-${id})`}
          />
          <Area
            type="monotone"
            dataKey="nuevos"
            stroke="#10b981"
            fillOpacity={1}
            fill={`url(#colorNuevos-${id})`}
          />
        </AreaChart>
      </ResponsiveContainer>
      
      <p className="text-xs text-gray-500 mt-2 text-center">
        Últimos 7 días de atención
      </p>
    </Card>
  );
}

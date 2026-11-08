import { Card } from "./ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Timer } from "lucide-react";
import { allClients } from "../data/mockClients";

const COLORS = {
  moto: "#10b981",
  carro: "#3b82f6", 
  pesado: "#ef4444",
};

export function ServiceTimeChart() {
  // Calcular tiempo promedio por tipo de vehículo
  const timeData = allClients.reduce((acc, client) => {
    const tipo = client.tipoVehiculo;
    const tiempo = client.tiempoAtencion || 0;
    
    if (!acc[tipo]) {
      acc[tipo] = { total: 0, count: 0 };
    }
    
    acc[tipo].total += tiempo;
    acc[tipo].count += 1;
    
    return acc;
  }, {} as Record<string, { total: number; count: number }>);

  const chartData = [
    {
      tipo: "Motos",
      key: "moto",
      minutos: Math.round((timeData.moto?.total || 0) / (timeData.moto?.count || 1)),
    },
    {
      tipo: "Carros",
      key: "carro",
      minutos: Math.round((timeData.carro?.total || 0) / (timeData.carro?.count || 1)),
    },
    {
      tipo: "Pesados",
      key: "pesado",
      minutos: Math.round((timeData.pesado?.total || 0) / (timeData.pesado?.count || 1)),
    },
  ];

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Timer className="w-5 h-5 text-indigo-600" />
        <h3 className="font-semibold text-gray-900">Tiempo de Atención</h3>
      </div>
      
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            type="number"
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
            label={{ value: 'Minutos', position: 'insideBottom', offset: -5, style: { fontSize: 11 } }}
          />
          <YAxis 
            type="category"
            dataKey="tipo" 
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
            width={70}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "#fff", 
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "12px"
            }}
            formatter={(value: number) => [`${value} min`, "Tiempo Promedio"]}
          />
          <Bar 
            dataKey="minutos" 
            radius={[0, 8, 8, 0]}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.key as keyof typeof COLORS]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      
      <p className="text-xs text-gray-500 mt-2 text-center">
        Tiempo promedio de atención por tipo de vehículo
      </p>
    </Card>
  );
}

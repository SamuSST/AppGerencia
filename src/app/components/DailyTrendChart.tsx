import { Card } from "./ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";
import { allClients } from "../data/mockClients";

export function DailyTrendChart() {
  // Agrupar por fecha
  const dailyData = allClients.reduce((acc, client) => {
    const date = client.fecha;
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Convertir a array y ordenar
  const chartData = Object.entries(dailyData)
    .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
    .slice(-10) // Últimos 10 días
    .map(([fecha, clientes]) => {
      const date = new Date(fecha);
      const day = date.getDate();
      const month = date.toLocaleDateString("es-ES", { month: "short" });
      
      return {
        fecha: `${day} ${month}`,
        clientes,
      };
    });

  // Calcular tendencia
  const promedio = chartData.reduce((sum, item) => sum + item.clientes, 0) / chartData.length;
  const ultimosDias = chartData.slice(-3);
  const promedioReciente = ultimosDias.reduce((sum, item) => sum + item.clientes, 0) / ultimosDias.length;
  const tendencia = promedioReciente > promedio ? "positiva" : "negativa";
  const diferencia = Math.abs(Math.round(((promedioReciente - promedio) / promedio) * 100));

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
          <h3 className="font-semibold text-gray-900">Tendencia Diaria</h3>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Últimos 3 días</p>
          <p className={`text-sm font-bold ${tendencia === "positiva" ? "text-emerald-600" : "text-red-600"}`}>
            {tendencia === "positiva" ? "+" : "-"}{diferencia}%
          </p>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={chartData}>
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
            formatter={(value: number) => [`${value} clientes`, ""]}
          />
          <Line 
            type="monotone" 
            dataKey="clientes" 
            stroke="#10b981" 
            strokeWidth={3}
            dot={{ fill: "#10b981", r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
      
      <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
        <p className="text-xs text-gray-500">Promedio: {Math.round(promedio)} clientes/día</p>
        <p className="text-xs text-gray-500">Últimos 10 días</p>
      </div>
    </Card>
  );
}

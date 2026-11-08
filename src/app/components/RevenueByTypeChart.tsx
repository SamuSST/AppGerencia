import { Card } from "./ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { DollarSign } from "lucide-react";
import { allClients } from "../data/mockClients";

export function RevenueByTypeChart() {
  // Calcular ingresos por tipo de vehículo
  const revenueData = allClients.reduce((acc, client) => {
    const tipo = client.tipoVehiculo;
    const ingreso = client.ingresoEstimado || 0;
    
    if (!acc[tipo]) {
      acc[tipo] = { total: 0, count: 0 };
    }
    
    acc[tipo].total += ingreso;
    acc[tipo].count += 1;
    
    return acc;
  }, {} as Record<string, { total: number; count: number }>);

  const chartData = [
    {
      tipo: "Carros",
      ingresos: Math.round(revenueData.carro?.total || 0),
      promedio: Math.round((revenueData.carro?.total || 0) / (revenueData.carro?.count || 1)),
    },
    {
      tipo: "Motos",
      ingresos: Math.round(revenueData.moto?.total || 0),
      promedio: Math.round((revenueData.moto?.total || 0) / (revenueData.moto?.count || 1)),
    },
    {
      tipo: "Pesados",
      ingresos: Math.round(revenueData.pesado?.total || 0),
      promedio: Math.round((revenueData.pesado?.total || 0) / (revenueData.pesado?.count || 1)),
    },
  ];

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <DollarSign className="w-5 h-5 text-green-600" />
        <h3 className="font-semibold text-gray-900">Ingresos por Tipo</h3>
      </div>
      
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="tipo" 
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
            label={{ value: 'Miles $', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "#fff", 
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "12px"
            }}
            formatter={(value: number) => [`$${value}k`, ""]}
          />
          <Legend 
            wrapperStyle={{ fontSize: "12px" }}
            formatter={(value) => value === "ingresos" ? "Total" : "Promedio"}
          />
          <Bar 
            dataKey="ingresos" 
            fill="#10b981" 
            radius={[8, 8, 0, 0]}
            name="ingresos"
          />
          <Bar 
            dataKey="promedio" 
            fill="#60a5fa" 
            radius={[8, 8, 0, 0]}
            name="promedio"
          />
        </BarChart>
      </ResponsiveContainer>
      
      <p className="text-xs text-gray-500 mt-2 text-center">
        Ingresos totales y promedio en miles de pesos
      </p>
    </Card>
  );
}

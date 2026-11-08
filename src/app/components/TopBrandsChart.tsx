import { Card } from "./ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Award } from "lucide-react";
import { allClients } from "../data/mockClients";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export function TopBrandsChart() {
  // Contar vehículos por marca
  const brandCounts = allClients.reduce((acc, client) => {
    if (!client.marca) return acc;
    
    acc[client.marca] = (acc[client.marca] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Convertir a array y ordenar
  const sortedBrands = Object.entries(brandCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6); // Top 6 marcas

  const chartData = sortedBrands.map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Award className="w-5 h-5 text-purple-600" />
        <h3 className="font-semibold text-gray-900">Marcas Más Atendidas</h3>
      </div>
      
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={70}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "#fff", 
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "12px"
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      
      <div className="mt-2 space-y-1">
        {sortedBrands.slice(0, 3).map(([brand, count], idx) => (
          <div key={brand} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: COLORS[idx] }}
              />
              <span className="text-gray-700">{brand}</span>
            </div>
            <span className="font-semibold text-gray-900">{count}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

import { Card } from "./ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Clock } from "lucide-react";
import { allClients } from "../data/mockClients";

export function PeakHoursChart() {
  // Agrupar clientes por franja horaria
  const hourlyData = allClients.reduce((acc, client) => {
    if (!client.hora) return acc;
    
    const hour = parseInt(client.hora.split(":")[0]);
    let timeSlot = "";
    
    if (hour >= 7 && hour < 10) timeSlot = "7-10am";
    else if (hour >= 10 && hour < 13) timeSlot = "10am-1pm";
    else if (hour >= 13 && hour < 16) timeSlot = "1-4pm";
    else if (hour >= 16 && hour < 19) timeSlot = "4-7pm";
    else return acc;
    
    const existing = acc.find(item => item.franja === timeSlot);
    if (existing) {
      existing.clientes += 1;
    } else {
      acc.push({ franja: timeSlot, clientes: 1 });
    }
    
    return acc;
  }, [] as { franja: string; clientes: number }[]);

  // Ordenar por franja horaria
  const orderedData = [
    { franja: "7-10am", clientes: 0 },
    { franja: "10am-1pm", clientes: 0 },
    { franja: "1-4pm", clientes: 0 },
    { franja: "4-7pm", clientes: 0 },
  ].map(slot => {
    const found = hourlyData.find(item => item.franja === slot.franja);
    return found || slot;
  });

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-orange-600" />
        <h3 className="font-semibold text-gray-900">Horarios Pico</h3>
      </div>
      
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={orderedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="franja" 
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "#fff", 
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "12px"
            }}
            labelStyle={{ color: "#111827", fontWeight: "600" }}
          />
          <Bar 
            dataKey="clientes" 
            fill="#f97316" 
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
      
      <p className="text-xs text-gray-500 mt-2 text-center">
        Distribución de atención por franjas horarias
      </p>
    </Card>
  );
}

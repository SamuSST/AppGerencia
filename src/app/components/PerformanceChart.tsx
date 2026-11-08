import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { useState, useId } from "react";

const weeklyData = [
  { periodo: "Lun", actual: 3, anterior: 2 },
  { periodo: "Mar", actual: 2, anterior: 3 },
  { periodo: "Mie", actual: 4, anterior: 2 },
  { periodo: "Jue", actual: 2, anterior: 4 },
  { periodo: "Vie", actual: 3, anterior: 3 },
  { periodo: "Sáb", actual: 0, anterior: 1 },
  { periodo: "Dom", actual: 0, anterior: 0 },
];

const monthlyData = [
  { periodo: "Ene", actual: 45, anterior: 38 },
  { periodo: "Feb", actual: 52, anterior: 42 },
  { periodo: "Mar", actual: 42, anterior: 48 },
  { periodo: "Abr", actual: 0, anterior: 51 },
  { periodo: "May", actual: 0, anterior: 45 },
  { periodo: "Jun", actual: 0, anterior: 55 },
  { periodo: "Jul", actual: 0, anterior: 49 },
  { periodo: "Ago", actual: 0, anterior: 52 },
  { periodo: "Sep", actual: 0, anterior: 47 },
  { periodo: "Oct", actual: 0, anterior: 58 },
  { periodo: "Nov", actual: 0, anterior: 54 },
  { periodo: "Dic", actual: 0, anterior: 60 },
];

const yearlyData = [
  { periodo: "2022", actual: 0, anterior: 0 },
  { periodo: "2023", actual: 0, anterior: 0 },
  { periodo: "2024", actual: 0, anterior: 450 },
  { periodo: "2025", actual: 568, anterior: 0 },
  { periodo: "2026", actual: 408, anterior: 0 },
];

export function PerformanceChart() {
  const id = useId();
  const [showComparison, setShowComparison] = useState(false);
  const [view, setView] = useState<"week" | "month" | "year">("week");

  const getChartData = () => {
    switch (view) {
      case "week":
        return weeklyData;
      case "month":
        return monthlyData;
      case "year":
        return yearlyData;
    }
  };

  const getGradientColors = () => {
    switch (view) {
      case "week":
        return { main: "#3b82f6", name: "Esta semana" };
      case "month":
        return { main: "#10b981", name: "2026" };
      case "year":
        return { main: "#8b5cf6", name: "Actual" };
    }
  };

  const getTotalLabel = () => {
    switch (view) {
      case "week":
        return { label: "Total esta semana", value: "14 clientes" };
      case "month":
        return { label: "Total 2026", value: "139 clientes" };
      case "year":
        return { label: "2026 (Ene-Mar)", value: "408 clientes" };
    }
  };

  const colors = getGradientColors();
  const total = getTotalLabel();

  return (
    <div className="bg-white rounded-xl shadow-md p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Rendimiento</h3>
        <div className="flex items-center gap-2">
          <Switch 
            id="comparison" 
            checked={showComparison}
            onCheckedChange={setShowComparison}
          />
          <Label htmlFor="comparison" className="text-xs text-gray-600 cursor-pointer">
            Comparar
          </Label>
        </div>
      </div>

      {/* Botones de navegación */}
      <div className="flex gap-2 mb-4">
        <Button
          variant={view === "week" ? "default" : "outline"}
          size="sm"
          onClick={() => setView("week")}
          className="flex-1 text-xs h-8"
        >
          Semana
        </Button>
        <Button
          variant={view === "month" ? "default" : "outline"}
          size="sm"
          onClick={() => setView("month")}
          className="flex-1 text-xs h-8"
        >
          Mes
        </Button>
        <Button
          variant={view === "year" ? "default" : "outline"}
          size="sm"
          onClick={() => setView("year")}
          className="flex-1 text-xs h-8"
        >
          Año
        </Button>
      </div>
      
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={getChartData()}>
          <defs>
            <linearGradient id={`colorActual-${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors.main} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={colors.main} stopOpacity={0}/>
            </linearGradient>
            <linearGradient id={`colorAnterior-${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis 
            dataKey="periodo" 
            tick={{ fontSize: view === "month" ? 10 : 11, fill: '#64748b' }}
            axisLine={{ stroke: '#e2e8f0' }}
            tickLine={false}
          />
          <YAxis 
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={{ stroke: '#e2e8f0' }}
            tickLine={false}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '12px'
            }}
          />
          {showComparison && (
            <Legend 
              wrapperStyle={{ fontSize: '11px' }}
              iconType="line"
            />
          )}
          <Area
            type="monotone"
            dataKey="actual"
            stroke={colors.main}
            strokeWidth={2}
            fillOpacity={1}
            fill={`url(#colorActual-${id})`}
            name={colors.name}
          />
          {showComparison && (
            <Area
              type="monotone"
              dataKey="anterior"
              stroke="#94a3b8"
              strokeWidth={2}
              strokeDasharray="5 5"
              fillOpacity={1}
              fill={`url(#colorAnterior-${id})`}
              name={view === "week" ? "Sem. pasada" : view === "month" ? "2025" : "Anterior"}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>

      <div className="mt-3 pt-3 border-t">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">{total.label}</span>
          <span className="text-base font-bold text-gray-900">{total.value}</span>
        </div>
        {showComparison && view === "year" && (
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-gray-500">2025 (total)</span>
            <span className="text-sm font-semibold text-gray-600">568 clientes</span>
          </div>
        )}
      </div>
    </div>
  );
}
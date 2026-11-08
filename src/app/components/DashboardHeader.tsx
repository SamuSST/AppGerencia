import { User } from "lucide-react";

export function DashboardHeader() {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Dashboard de Ventas</h1>
          <p className="text-sm text-blue-100 mt-1">Tecnomecánica</p>
        </div>
        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
          <User className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}
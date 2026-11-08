import { Home, Trophy, MapPin } from "lucide-react";

interface BottomNavProps {
  activeTab: "dashboard" | "ranking" | "recorrido";
  onTabChange: (tab: "dashboard" | "ranking" | "recorrido") => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50 md:hidden">
      <div className="max-w-md mx-auto grid grid-cols-3">
        <button
          onClick={() => onTabChange("dashboard")}
          className={`flex flex-col items-center gap-1 py-3 px-2 transition-colors ${
            activeTab === "dashboard"
              ? "text-blue-600"
              : "text-gray-500"
          }`}
        >
          <Home className="w-6 h-6" />
          <span className="text-xs font-medium">Dashboard</span>
        </button>

        <button
          onClick={() => onTabChange("recorrido")}
          className={`flex flex-col items-center gap-1 py-3 px-2 transition-colors ${
            activeTab === "recorrido"
              ? "text-green-600"
              : "text-gray-500"
          }`}
        >
          <MapPin className="w-6 h-6" />
          <span className="text-xs font-medium">Recorrido</span>
        </button>

        <button
          onClick={() => onTabChange("ranking")}
          className={`flex flex-col items-center gap-1 py-3 px-2 transition-colors ${
            activeTab === "ranking"
              ? "text-orange-600"
              : "text-gray-500"
          }`}
        >
          <Trophy className="w-6 h-6" />
          <span className="text-xs font-medium">Ranking</span>
        </button>
      </div>
    </div>
  );
}

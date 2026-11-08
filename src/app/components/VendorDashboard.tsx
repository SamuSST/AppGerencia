import { Calendar, TrendingUp, Target, ArrowLeft, LogOut } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { DashboardHeader } from "./DashboardHeader";
import { MetricCard } from "./MetricCard";
import { VehicleStats } from "./VehicleStats";
import { ServiceTypeStats } from "./ServiceTypeStats";
import { PerformanceChart } from "./PerformanceChart";
import { ClientList } from "./ClientList";
import { VendorsRanking } from "./VendorsRanking";
import { BottomNav } from "./BottomNav";
import { ClientDetailsSheet } from "./ClientDetailsSheet";
import { PeakHoursChart } from "./PeakHoursChart";
import { TopBrandsChart } from "./TopBrandsChart";
import { RevenueByTypeChart } from "./RevenueByTypeChart";
import { CustomerTypeChart } from "./CustomerTypeChart";
import { ServiceTimeChart } from "./ServiceTimeChart";
import { DailyTrendChart } from "./DailyTrendChart";
import { DailyRoute } from "./DailyRoute";
import {
  allClients,
  getClientsByDate,
  getClientsByVehicleType,
  getClientsByServiceType
} from "../data/mockClients";
import { getCDAById, getVendedorById } from "../data/mockCDAs";
import { Card } from "./ui/card";
import logo from "figma:asset/9b6752e4935d81eb0c34c840e006a7ba641d4c8e.png";

export function VendorDashboard() {
  const navigate = useNavigate();
  const { cdaId, vendedorId } = useParams();
  const [activeTab, setActiveTab] = useState<"dashboard" | "ranking" | "recorrido">("dashboard");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetTitle, setSheetTitle] = useState("");
  const [sheetClients, setSheetClients] = useState<typeof allClients>([]);

  const cda = getCDAById(Number(cdaId));
  const vendedor = getVendedorById(Number(cdaId), Number(vendedorId));

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    navigate("/");
  };

  if (!cda || !vendedor) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">Vendedor no encontrado</p>
      </div>
    );
  }

  const handleDailyClick = () => {
    const todayClients = getClientsByDate("2026-03-09");
    setSheetTitle("Clientes de Hoy");
    setSheetClients(todayClients);
    setSheetOpen(true);
  };

  const handleVehicleCategoryClick = (category: "carro" | "moto" | "pesado") => {
    const clients = getClientsByVehicleType(category);
    const titles = {
      carro: "Carros",
      moto: "Motos",
      pesado: "Vehículos Pesados"
    };
    setSheetTitle(titles[category]);
    setSheetClients(clients);
    setSheetOpen(true);
  };

  const handleServiceCategoryClick = (category: "publico" | "particular") => {
    const clients = getClientsByServiceType(category);
    const titles = {
      publico: "Servicios Públicos",
      particular: "Servicios Particulares"
    };
    setSheetTitle(titles[category]);
    setSheetClients(clients);
    setSheetOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-20 md:pb-0">
      {/* Header con logo sticky */}
      <div className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto p-3 px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <img src={logo} alt="Grupo Cardisel" className="h-10 w-auto" />
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Custom Header con info del vendedor */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto p-4 px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-lg font-bold">
                {vendedor.nombre.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold">{vendedor.nombre}</h1>
                <p className="text-blue-100 text-sm">{cda.nombre}</p>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <div className="hidden md:flex gap-2 mt-4">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === "dashboard"
                  ? "bg-white text-blue-600"
                  : "bg-blue-700/50 text-blue-100 hover:bg-blue-700"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("recorrido")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === "recorrido"
                  ? "bg-white text-blue-600"
                  : "bg-blue-700/50 text-blue-100 hover:bg-blue-700"
              }`}
            >
              Recorrido
            </button>
            <button
              onClick={() => setActiveTab("ranking")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === "ranking"
                  ? "bg-white text-blue-600"
                  : "bg-blue-700/50 text-blue-100 hover:bg-blue-700"
              }`}
            >
              Ranking
            </button>
          </div>
        </div>
      </div>

      {activeTab === "dashboard" ? (
        <div className="p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6 max-w-7xl mx-auto">
          {/* Info del vendedor */}
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-xs text-gray-600 mb-1">Meta Diaria</p>
                <p className="text-lg font-bold text-blue-900">{vendedor.metaDiaria}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Meta Mensual</p>
                <p className="text-lg font-bold text-blue-900">{vendedor.metaMensual}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Meta Anual</p>
                <p className="text-lg font-bold text-blue-900">{vendedor.metaAnual}</p>
              </div>
            </div>
          </Card>

          {/* Métricas principales */}
          <div className="space-y-3">
            <MetricCard
              title="Hoy"
              value={3}
              icon={Calendar}
              period="9 de Marzo, 2026"
              color="bg-blue-600"
              onClick={handleDailyClick}
            />

            <MetricCard
              title="Este Mes"
              percentage={vendedor.desempeñoMensual}
              icon={TrendingUp}
              period="Marzo 2026"
              color="bg-green-600"
            />

            <MetricCard
              title="Este Año"
              percentage={68}
              icon={Target}
              period="2026"
              color="bg-purple-600"
            />
          </div>

          {/* Gráfico semanal */}
          <PerformanceChart />

          {/* Gráficos de análisis */}
          <DailyTrendChart />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <CustomerTypeChart />
            <PeakHoursChart />
          </div>

          {/* Estadísticas de vehículos */}
          <VehicleStats onCategoryClick={handleVehicleCategoryClick} />

          {/* Tipo de servicio */}
          <ServiceTypeStats onCategoryClick={handleServiceCategoryClick} />

          {/* Más gráficos de análisis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            <RevenueByTypeChart />
            <ServiceTimeChart />
            <TopBrandsChart />
          </div>

          {/* Lista de clientes recientes */}
          <ClientList />
        </div>
      ) : activeTab === "recorrido" ? (
        <DailyRoute />
      ) : (
        <VendorsRanking />
      )}

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      <ClientDetailsSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title={sheetTitle}
        clients={sheetClients}
      />
    </div>
  );
}
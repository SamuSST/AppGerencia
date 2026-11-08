import { Card } from "./ui/card";
import { Building2, Users, TrendingUp, ChevronRight, MapPin, Phone, LogOut, Target, Trophy, Medal, Award } from "lucide-react";
import { mockCDAs } from "../data/mockCDAs";
import { useNavigate } from "react-router";
import logo from "figma:asset/9b6752e4935d81eb0c34c840e006a7ba641d4c8e.png";
import { useState } from "react";

export function AdminCDAList() {
  const navigate = useNavigate();
  const [view, setView] = useState<"list" | "ranking">("list");

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    navigate("/");
  };

  const getStatusColor = (desempeño: number) => {
    if (desempeño >= 75) return "bg-green-500";
    if (desempeño >= 50) return "bg-orange-500";
    return "bg-red-500";
  };

  const getStatusText = (desempeño: number) => {
    if (desempeño >= 75) return "Excelente";
    if (desempeño >= 50) return "Aceptable";
    return "Bajo";
  };

  const getRankingIcon = (position: number) => {
    if (position === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (position === 2) return <Medal className="w-6 h-6 text-gray-500" />;
    if (position === 3) return <Award className="w-6 h-6 text-amber-600" />;
    return <span className="text-xl font-bold text-gray-500">#{position}</span>;
  };

  const sortedCDAs = [...mockCDAs].sort((a, b) => {
    const percentageA = (a.clientesMes / a.metaMensual) * 100;
    const percentageB = (b.clientesMes / b.metaMensual) * 100;
    return percentageB - percentageA;
  });

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header con logo */}
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

      {/* Título */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="w-8 h-8" />
            <h1 className="text-2xl md:text-3xl font-bold">Panel Administrativo</h1>
          </div>
          <p className="text-blue-100 text-sm md:text-base">Gestión de Centros de Diagnóstico</p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-3 gap-3 mb-4">
          <Card className="p-3 text-center">
            <Building2 className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-gray-900">{mockCDAs.length}</p>
            <p className="text-xs text-gray-500">CDAs</p>
          </Card>
          <Card className="p-3 text-center">
            <Users className="w-5 h-5 text-green-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-gray-900">
              {mockCDAs.reduce((sum, cda) => sum + cda.totalVendedores, 0)}
            </p>
            <p className="text-xs text-gray-500">Vendedores</p>
          </Card>
          <Card className="p-3 text-center">
            <TrendingUp className="w-5 h-5 text-purple-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-gray-900">
              {mockCDAs.reduce((sum, cda) => sum + cda.clientesMes, 0)}
            </p>
            <p className="text-xs text-gray-500">Clientes/mes</p>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setView("list")}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
              view === "list"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            Lista de CDAs
          </button>
          <button
            onClick={() => setView("ranking")}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
              view === "ranking"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            Ranking
          </button>
        </div>

        {view === "list" ? (
          /* CDA List */
          <div>
            <h2 className="font-semibold text-gray-900 text-lg mb-4">Centros de Diagnóstico</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockCDAs.map((cda) => {
              const cumplimiento = ((cda.clientesMes / cda.metaMensual) * 100).toFixed(0);
              return (
                <Card 
                  key={cda.id} 
                  className="p-4 cursor-pointer hover:shadow-lg transition-all active:scale-98"
                  onClick={() => navigate(`/cda/${cda.id}`)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-1">{cda.nombre}</h3>
                      <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                        <MapPin className="w-3 h-3" />
                        <span>{cda.ciudad}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <Phone className="w-3 h-3" />
                        <span>{cda.telefono}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-xs text-gray-500">Vendedores</p>
                      <p className="text-lg font-bold text-gray-900">{cda.totalVendedores}</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-2">
                      <p className="text-xs text-gray-500">Meta</p>
                      <p className="text-lg font-bold text-blue-900">{cda.metaMensual}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-2">
                      <p className="text-xs text-gray-500">Alcanzado</p>
                      <p className="text-lg font-bold text-green-900">{cda.clientesMes}</p>
                    </div>
                  </div>

                  {/* Performance Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Cumplimiento de Meta</span>
                      <span className="font-semibold text-gray-900">{cumplimiento}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getStatusColor(Number(cumplimiento))} transition-all`}
                        style={{ width: `${Math.min(Number(cumplimiento), 100)}%` }}
                      />
                    </div>
                    <p className={`text-xs font-medium ${
                      Number(cumplimiento) >= 75 ? 'text-green-600' : 
                      Number(cumplimiento) >= 50 ? 'text-orange-600' : 
                      'text-red-600'
                    }`}>
                      {getStatusText(Number(cumplimiento))}
                    </p>
                  </div>
                </Card>
              );
            })}
            </div>
          </div>
        ) : (
          /* Ranking View */
          <div>
            <div className="space-y-3 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4 md:space-y-0">
            <h2 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              Ranking de CDAs
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Ordenado por cumplimiento de meta mensual
            </p>

            {sortedCDAs.map((cda, index) => {
              const cumplimiento = ((cda.clientesMes / cda.metaMensual) * 100).toFixed(0);
              const position = index + 1;
              
              return (
                <Card 
                  key={cda.id}
                  className={`p-4 cursor-pointer hover:shadow-lg transition-all ${
                    position === 1 ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300' :
                    position === 2 ? 'bg-gradient-to-r from-gray-50 to-slate-50 border-2 border-gray-300' :
                    position === 3 ? 'bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-300' :
                    ''
                  }`}
                  onClick={() => navigate(`/cda/${cda.id}`)}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex items-center justify-center w-12 h-12 shrink-0">
                      {getRankingIcon(position)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 mb-1">{cda.nombre}</h3>
                      <p className="text-xs text-gray-600">{cda.ciudad}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Meta</p>
                      <p className="text-sm font-bold text-gray-900">{cda.metaMensual}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Alcanzado</p>
                      <p className="text-sm font-bold text-blue-900">{cda.clientesMes}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Cumplimiento</p>
                      <p className={`text-sm font-bold ${
                        Number(cumplimiento) >= 75 ? 'text-green-600' :
                        Number(cumplimiento) >= 50 ? 'text-orange-600' :
                        'text-red-600'
                      }`}>
                        {cumplimiento}%
                      </p>
                    </div>
                  </div>

                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${getStatusColor(Number(cumplimiento))} transition-all`}
                      style={{ width: `${Math.min(Number(cumplimiento), 100)}%` }}
                    />
                  </div>
                </Card>
              );
            })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
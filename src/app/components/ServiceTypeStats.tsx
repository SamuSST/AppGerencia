import { Users, User } from "lucide-react";

interface ServiceType {
  type: string;
  count: number;
  icon: typeof Users;
  color: string;
  bgColor: string;
  key: "publico" | "particular";
}

interface ServiceTypeStatsProps {
  onCategoryClick: (category: "publico" | "particular") => void;
}

const serviceData: ServiceType[] = [
  { type: "Públicos", count: 15, icon: Users, color: "text-purple-600", bgColor: "bg-purple-100", key: "publico" },
  { type: "Particulares", count: 27, icon: User, color: "text-blue-600", bgColor: "bg-blue-100", key: "particular" },
];

export function ServiceTypeStats({ onCategoryClick }: ServiceTypeStatsProps) {
  const total = serviceData.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="bg-white rounded-xl shadow-md p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Tipo de Servicio</h3>
      
      <div className="space-y-3">
        {serviceData.map((service) => {
          const Icon = service.icon;
          const percentage = ((service.count / total) * 100).toFixed(0);
          
          return (
            <div 
              key={service.type}
              className="cursor-pointer active:scale-95 transition-transform"
              onClick={() => onCategoryClick(service.key)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg ${service.bgColor} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${service.color}`} />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{service.type}</span>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">{service.count}</p>
                  <p className="text-xs text-gray-500">{percentage}%</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-3">
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden flex">
          {serviceData.map((service, index) => {
            const percentage = (service.count / total) * 100;
            return (
              <div
                key={index}
                className={service.bgColor}
                style={{ width: `${percentage}%` }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
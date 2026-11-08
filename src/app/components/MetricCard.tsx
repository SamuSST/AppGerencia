import { LucideIcon } from "lucide-react";
import { Progress } from "./ui/progress";

interface MetricCardProps {
  title: string;
  value?: number;
  percentage?: number;
  icon: LucideIcon;
  period: string;
  color: string;
  onClick?: () => void;
}

export function MetricCard({ title, value, percentage, icon: Icon, period, color, onClick }: MetricCardProps) {
  const isDaily = value !== undefined && percentage === undefined;
  const displayPercentage = percentage || 0;
  const isOnTrack = displayPercentage >= 75;

  return (
    <div 
      className={`bg-white rounded-xl shadow-md p-4 ${onClick ? 'cursor-pointer active:scale-95 transition-transform' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">{title}</p>
          <p className="text-xs text-gray-500">{period}</p>
        </div>
      </div>
      
      {isDaily ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Clientes atendidos</span>
            <span className="text-3xl font-bold text-gray-900">{value}</span>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-gray-900">{displayPercentage}%</span>
          </div>
          
          <Progress value={displayPercentage} className="h-2" />
          
          <p className={`text-xs font-medium ${isOnTrack ? 'text-green-600' : 'text-orange-600'}`}>
            {isOnTrack ? '✓ En camino' : '⚠ Esfuerzo extra'}
          </p>
        </div>
      )}
    </div>
  );
}
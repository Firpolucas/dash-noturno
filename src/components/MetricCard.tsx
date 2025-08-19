import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { MetricCardProps } from "@/types/dashboard";
import { cn } from "@/lib/utils";

export const MetricCard = ({ title, value, subtitle, trend, icon }: MetricCardProps) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'positive':
        return <TrendingUp className="h-4 w-4 text-metric-positive" />;
      case 'negative':
        return <TrendingDown className="h-4 w-4 text-metric-negative" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'positive':
        return 'text-metric-positive';
      case 'negative':
        return 'text-metric-negative';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <Card className="p-6 bg-gradient-card shadow-card hover:shadow-hover transition-all duration-300 animate-fade-in">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {subtitle && (
            <div className="flex items-center space-x-1">
              {getTrendIcon()}
              <span className={cn("text-sm font-medium", getTrendColor())}>
                {subtitle}
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};
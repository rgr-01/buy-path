import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  variant?: "default" | "success" | "warning" | "destructive";
}

export function StatsCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend,
  variant = "default" 
}: StatsCardProps) {
  const iconStyles = {
    default: "bg-primary-light text-primary",
    success: "bg-success-light text-success",
    warning: "bg-warning-light text-warning",
    destructive: "bg-destructive-light text-destructive"
  };

  return (
    <Card className="bg-card shadow-soft border border-border hover:shadow-medium transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-label text-muted-foreground uppercase tracking-wider mb-2">
              {title}
            </p>
            <p className="text-metric font-bold text-foreground">
              {value}
            </p>
            {description && (
              <p className="text-body-sm text-muted-foreground mt-1">
                {description}
              </p>
            )}
            {trend && (
              <div className="flex items-center gap-1 mt-2">
                <span className={cn(
                  "text-body-sm font-medium",
                  trend.value > 0 ? "text-success" : trend.value < 0 ? "text-destructive" : "text-muted-foreground"
                )}>
                  {trend.value > 0 ? "+" : ""}{trend.value}%
                </span>
                <span className="text-body-sm text-muted-foreground">
                  {trend.label}
                </span>
              </div>
            )}
          </div>
          <div className={cn(
            "h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0",
            iconStyles[variant]
          )}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

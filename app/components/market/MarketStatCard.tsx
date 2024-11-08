import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface MarketStatCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  description?: string;
}

export function MarketStatCard({
  title,
  value,
  change,
  icon,
  description
}: MarketStatCardProps) {
  return (
    <Card>
      <CardHeader className="space-y-0 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-2xl font-bold">{value}</div>
          {change !== 0 && (
            <div className={`text-sm ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(2)}%
            </div>
          )}
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
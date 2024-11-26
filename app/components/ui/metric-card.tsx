import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpIcon, ArrowDownIcon, TrendingUpIcon, DollarSignIcon, ChartIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  trend?: number;
  icon?: 'chart-up' | 'dollar-sign' | 'trending-up';
}

const icons = {
  'chart-up': ChartIcon,
  'dollar-sign': DollarSignIcon,
  'trending-up': TrendingUpIcon,
};

export function MetricCard({ title, value, trend, icon }: MetricCardProps) {
  const Icon = icon ? icons[icon] : null;
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend !== undefined && (
          <p className={`text-xs ${trend >= 0 ? 'text-green-500' : 'text-red-500'} flex items-center`}>
            {trend >= 0 ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />}
            {Math.abs(trend)}%
          </p>
        )}
      </CardContent>
    </Card>
  );
}
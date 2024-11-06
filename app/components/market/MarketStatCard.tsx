import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface MarketStatCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
}

export function MarketStatCard({ title, value, change, icon }: MarketStatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            {icon}
            <div>
              <p className="text-sm text-muted-foreground">{title}</p>
              <p className="text-2xl font-bold mt-1">{value}</p>
            </div>
          </div>
          <div className={`flex items-center ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            <span className="ml-1">{Math.abs(change)}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
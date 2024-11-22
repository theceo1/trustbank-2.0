import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { UnifiedTradeService } from '@/app/lib/services/unifiedTrade';
import { useToast } from '@/hooks/use-toast';

const statusIcons = {
  pending: Clock,
  completed: CheckCircle2,
  failed: XCircle
} as const;

const statusColors = {
  pending: 'text-yellow-500',
  completed: 'text-green-500',
  failed: 'text-red-500'
} as const;

interface TradeStatusProps {
  tradeId: string;
  onStatusChange?: (status: string) => void;
}

export function TradeStatus({ tradeId, onStatusChange }: TradeStatusProps) {
  const [trade, setTrade] = useState<UnifiedTradeService.TradeDetails | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const tradeData = await UnifiedTradeService.getTrade(tradeId);
        setTrade(tradeData);
        
        if (onStatusChange && tradeData.status !== 'pending') {
          onStatusChange(tradeData.status);
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch trade status',
          variant: 'destructive'
        });
      }
    };

    const interval = setInterval(checkStatus, 5000);
    checkStatus();

    return () => clearInterval(interval);
  }, [tradeId, onStatusChange, toast]);

  if (!trade) return null;

  const StatusIcon = statusIcons[trade.status as keyof typeof statusIcons];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <StatusIcon className={`h-5 w-5 ${statusColors[trade.status as keyof typeof statusColors]}`} />
          Trade Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center">
          <p className={`text-lg font-medium ${statusColors[trade.status as keyof typeof statusColors]}`}>
            {trade.status.charAt(0).toUpperCase() + trade.status.slice(1)}
          </p>
          {trade.status === 'pending' && (
            <p className="text-sm text-muted-foreground mt-2">
              Waiting for payment confirmation...
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
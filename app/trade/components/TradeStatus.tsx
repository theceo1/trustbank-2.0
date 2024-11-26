import { useEffect, useState } from "react";
import { TradeStatus as TStatus } from "@/app/types/trade";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/app/components/ui/spinner";
import { CheckCircle, XCircle, Clock } from "lucide-react";

interface TradeStatusProps {
  tradeId: string;
  initialStatus: TStatus;
  onStatusChange?: (status: TStatus) => void;
}

export function TradeStatus({ tradeId, initialStatus, onStatusChange }: TradeStatusProps) {
  const [status, setStatus] = useState<TStatus>(initialStatus);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/trades/${tradeId}/status`);
        const data = await response.json();
        
        if (!response.ok) throw new Error(data.error);
        
        setStatus(data.status);
        onStatusChange?.(data.status);
      } catch (error) {
        console.error('Error checking trade status:', error);
      } finally {
        setLoading(false);
      }
    };

    const interval = setInterval(checkStatus, 5000);
    checkStatus(); // Initial check

    return () => clearInterval(interval);
  }, [tradeId, onStatusChange]);

  if (loading) return <Spinner />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trade Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          {status === 'completed' && <CheckCircle className="h-6 w-6 text-green-500" />}
          {status === 'failed' && <XCircle className="h-6 w-6 text-red-500" />}
          {(status === 'pending' || status === 'processing') && (
            <Clock className="h-6 w-6 text-yellow-500" />
          )}
          <span className="capitalize">{status}</span>
        </div>
      </CardContent>
    </Card>
  );
}
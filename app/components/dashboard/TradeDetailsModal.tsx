import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/app/lib/utils";
import { useState } from "react";
import { PaymentMethodType } from "@/app/types/payment";

interface TradeDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceed: () => Promise<void>;
  tradeDetails: {
    type: 'buy' | 'sell';
    currency: string;
    amount: number;
    rate: number;
    total: number;
    paymentMethod: PaymentMethodType;
    fees: {
      service: number;
      network: number;
    };
  };
}

export function TradeDetailsModal({
  isOpen,
  onClose,
  onProceed,
  tradeDetails
}: TradeDetailsModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleProceed = async () => {
    setIsProcessing(true);
    try {
      await onProceed();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Trade Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-sm text-muted-foreground">Type</div>
            <div className="text-sm font-medium">{tradeDetails.type.toUpperCase()}</div>
            
            <div className="text-sm text-muted-foreground">Currency</div>
            <div className="text-sm font-medium">{tradeDetails.currency}</div>
            
            <div className="text-sm text-muted-foreground">Amount</div>
            <div className="text-sm font-medium">{formatCurrency(tradeDetails.amount)}</div>
            
            <div className="text-sm text-muted-foreground">Rate</div>
            <div className="text-sm font-medium">{formatCurrency(tradeDetails.rate)}</div>
            
            <div className="text-sm text-muted-foreground">Service Fee</div>
            <div className="text-sm font-medium">{formatCurrency(tradeDetails.fees.service)}</div>
            
            <div className="text-sm text-muted-foreground">Network Fee</div>
            <div className="text-sm font-medium">{formatCurrency(tradeDetails.fees.network)}</div>
            
            <div className="text-sm text-muted-foreground">Total</div>
            <div className="text-sm font-medium">{formatCurrency(tradeDetails.total)}</div>
            
            <div className="text-sm text-muted-foreground">Payment Method</div>
            <div className="text-sm font-medium">{tradeDetails.paymentMethod}</div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose} disabled={isProcessing}>
              Cancel
            </Button>
            <Button onClick={handleProceed} disabled={isProcessing}>
              {isProcessing ? 'Processing...' : 'Confirm Trade'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
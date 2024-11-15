"use client";

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Icons } from '@/app/components/ui/icons';
import { PaymentMethodType } from '@/app/types/payment';
import { formatCurrency } from '@/app/lib/utils';

interface PaymentMethodSelectorProps {
  onSelect: (method: PaymentMethodType) => void;
  selectedMethod: PaymentMethodType;
  amount: number;
  walletBalance?: number;
  disabled?: boolean;
}

export function PaymentMethodSelector({
  onSelect,
  selectedMethod,
  amount,
  walletBalance = 0,
  disabled = false
}: PaymentMethodSelectorProps) {
  const [error, setError] = useState<string | null>(null);

  const handleMethodSelect = (method: PaymentMethodType) => {
    setError(null);
    
    if (method === 'wallet' && amount > walletBalance) {
      setError('Insufficient wallet balance');
      return;
    }
    
    onSelect(method);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <RadioGroup
          value={selectedMethod}
          onValueChange={(value) => handleMethodSelect(value as PaymentMethodType)}
          disabled={disabled}
        >
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <RadioGroupItem value="card" id="card" />
              <Label htmlFor="card" className="flex items-center space-x-2">
                <Icons.creditCard className="h-4 w-4" />
                <span>Card Payment</span>
              </Label>
            </div>

            <div className="flex items-center space-x-4">
              <RadioGroupItem value="bank" id="bank" />
              <Label htmlFor="bank" className="flex items-center space-x-2">
                <Icons.bank className="h-4 w-4" />
                <span>Bank Transfer</span>
              </Label>
            </div>

            <div className="flex items-center space-x-4">
              <RadioGroupItem 
                value="wallet" 
                id="wallet"
                disabled={amount > walletBalance}
              />
              <Label 
                htmlFor="wallet" 
                className="flex items-center justify-between flex-1"
              >
                <div className="flex items-center space-x-2">
                  <Icons.wallet className="h-4 w-4" />
                  <span>Wallet Balance</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {formatCurrency(walletBalance, 'NGN')}
                </span>
              </Label>
            </div>
          </div>
        </RadioGroup>

        {error && (
          <p className="text-sm text-destructive mt-2">{error}</p>
        )}
      </CardContent>
    </Card>
  );
}
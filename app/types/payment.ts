export const PLATFORM_FEES = {
  quidax: 0.014, // 1.4% Quidax fee
  platform: 0.016, // 1.6% Platform fee
  total: 0.03 // 3% Total fee
};

export type PaymentMethodType = 'card' | 'bank' | 'wallet';

export interface PaymentMethodConfig {
  type: PaymentMethodType;
  name: string;
  fees: {
    percentage: number;
    fixed: number;
  };
}

export const PAYMENT_METHODS: Record<PaymentMethodType, PaymentMethodConfig> = {
  card: {
    type: 'card',
    name: 'Card Payment',
    fees: {
      percentage: 1.5,
      fixed: 100
    }
  },
  bank: {
    type: 'bank',
    name: 'Bank Transfer',
    fees: {
      percentage: 0.5,
      fixed: 50
    }
  },
  wallet: {
    type: 'wallet',
    name: 'Wallet Balance',
    fees: {
      percentage: 0,
      fixed: 0
    }
  }
};

export interface PaymentMethodSelectionProps {
  availableMethods: PaymentMethodType[];
  onSelect: (method: PaymentMethodType) => void;
  selectedMethod: PaymentMethodType;
  walletBalance?: number;
}
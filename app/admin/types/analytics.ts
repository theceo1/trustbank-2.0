export interface AnalyticsData {
    userGrowth: UserGrowthData[];
    referralMetrics: ReferralMetricData[];
    transactionData: TransactionData[];
  }
  
  export interface UserGrowthData {
    timestamp: string;
    count: number;
  }
  
  export interface ReferralMetricData {
    timestamp: string;
    value: number;
  }
  
  export interface TransactionData {
    timestamp: string;
    amount: number;
    status: string;
  }
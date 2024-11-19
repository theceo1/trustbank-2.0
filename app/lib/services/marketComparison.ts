export interface ExchangeRate {
  exchange: string;
  buyRate: number;
  sellRate: number;
  spread: number;
  fees: {
    trading: number;
    withdrawal: number;
  };
}

export class MarketComparisonService {
  static async getCompetitorRates(currency: string): Promise<ExchangeRate[]> {
    try {
      const [buyResponse, sellResponse] = await Promise.all([
        fetch(`/api/transactions/rate?currency=${currency}&amount=1&type=buy`),
        fetch(`/api/transactions/rate?currency=${currency}&amount=1&type=sell`)
      ]);

      if (!buyResponse.ok || !sellResponse.ok) {
        throw new Error('Failed to fetch rates');
      }

      const buyData = await buyResponse.json();
      const sellData = await sellResponse.json();

      const spread = ((buyData.rate - sellData.rate) / sellData.rate) * 100;

      return [{
        exchange: 'TrustBank',
        buyRate: buyData.rate,
        sellRate: sellData.rate,
        spread: Number(spread.toFixed(2)),
        fees: {
          trading: (buyData.fee / buyData.rate) * 100,
          withdrawal: 0.3
        }
      }];
    } catch (error) {
      console.error('Error fetching rates:', error);
      return [];
    }
  }
}
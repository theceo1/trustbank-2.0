export const FEES = {
    platform: {
      quidax: 0.014, // 1.4% Quidax fee
      service: 0.016, // 1.6% Our platform fee
    },
    payment: {
      card: {
        fixed: 100, // ₦100
        percentage: 0.015 // 1.5%
      },
      bank: {
        fixed: 50, // ₦50
        percentage: 0.005 // 0.5%
      },
      wallet: {
        fixed: 0,
        percentage: 0
      }
    }
  };
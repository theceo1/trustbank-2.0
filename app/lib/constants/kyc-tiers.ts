export const KYC_TIERS = {
    unverified: {
      dailyLimit: 20000,
      monthlyLimit: 100000,
      annualLimit: 1000000,
      requirements: []
    },
    tier1: {
      dailyLimit: 100000,
      monthlyLimit: 500000,
      annualLimit: 5000000,
      requirements: ['BVN Verification']
    },
    tier2: {
      dailyLimit: 500000,
      monthlyLimit: 2000000,
      annualLimit: 20000000,
      requirements: ['BVN Verification', 'ID Verification']
    },
    tier3: {
      dailyLimit: 2000000,
      monthlyLimit: 10000000,
      annualLimit: 100000000,
      requirements: ['BVN Verification', 'ID Verification', 'Address Verification']
    }
  };
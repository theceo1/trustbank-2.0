export const KYC_TIERS = {
    unverified: {
      name: "Unverified",
      description: "Limited access to platform features",
      dailyLimit: 0,
      monthlyLimit: 0,
      requirements: [],
      color: "text-gray-500",
      benefits: ["Create account", "View market prices"]
    },
    tier1: {
      name: "Basic",
      description: "Start trading with basic verification",
      dailyLimit: 100000,
      monthlyLimit: 500000,
      requirements: ["NIN Verification", "Selfie Verification"],
      color: "text-blue-500",
      benefits: [
        "Basic trading features",
        "Deposit up to ₦100,000 daily",
        "Withdraw up to ₦100,000 daily",
        "Basic support"
      ]
    },
    tier2: {
      name: "Intermediate",
      description: "Enhanced features with BVN verification",
      dailyLimit: 500000,
      monthlyLimit: 2000000,
      requirements: ["NIN Verification", "Selfie Verification", "BVN Verification"],
      color: "text-purple-500",
      benefits: [
        "All Basic features",
        "Increased daily limits",
        "Priority support",
        "Advanced trading features"
      ]
    },
    tier3: {
      name: "Advanced",
      description: "Full access with government ID verification",
      dailyLimit: 2000000,
      monthlyLimit: 10000000,
      requirements: [
        "NIN Verification",
        "Selfie Verification",
        "BVN Verification",
        "Government ID (Driver's License or International Passport)"
      ],
      color: "text-gold-500",
      benefits: [
        "All Intermediate features",
        "Highest transaction limits",
        "VIP support",
        "Advanced analytics",
        "Premium features"
      ]
    }
  };
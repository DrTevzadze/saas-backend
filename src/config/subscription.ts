// FREE: 10 files, 1 user, cost: 0
// BASIC: 100, 10 users, cost: +5$ for every additional user
// PREMIUM: 1000 files, unlimited users, baseCost: 300$, additionalCost: 1000+ files extra 0.5$

export const subscriptionConfig = {
  FREE: {
    employeeLimits: 1,
    fileUploadLimit: 10,
    baseCost: 0,
    extraSubscriptionCost: 0,
  },
  BASIC: {
    employeeLimits: 10,
    fileUploadLimit: 100,
    baseCost: 20,
    extraSubscriptionCost: 5,
  },
  PREMIUM: {
    employeeLimits: Infinity,
    fileUploadLimit: 1000,
    baseCost: 300,
    extraSubscriptionCost: 0.5,
  },
};

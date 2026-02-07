export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    period: 'forever',
    description: 'Get started with the basics',
    features: [
      '1 active goal',
      '3 AI-generated tasks per week',
      'Basic leaderboard access',
      'Community support',
    ],
  },
  premium: {
    name: 'Premium',
    price: 4.99,
    period: '/month',
    description: 'Full power unlocked for serious achievers',
    checkoutUrl: 'https://xplife.lemonsqueezy.com/checkout/buy/8db20f22-8c42-4727-bca5-1b3fc5d87d5b',
    features: [
      'Unlimited AI tasks daily',
      '3 parallel goals',
      'Full AI coaching & insights',
      'Streak freezes (3/month)',
      'Priority leaderboard',
      'Advanced analytics',
    ],
  },
  lifetime: {
    name: 'Lifetime',
    price: 49,
    period: 'one-time',
    description: 'Everything in Premium, forever',
    checkoutUrl: 'https://xplife.lemonsqueezy.com/checkout/buy/04853322-5000-40db-b6b4-6659235ca9e3',
    features: [
      'Everything in Premium, forever',
      'Limited to first 100 users',
      'No recurring payments',
      'Founding member badge',
      'Early access to new features',
    ],
  },
} as const

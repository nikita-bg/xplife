# LemonSqueezy Setup Guide

Follow these steps to create your products in the LemonSqueezy dashboard and connect them to the app.

## 1. Create a LemonSqueezy Account

Sign up at [lemonsqueezy.com](https://lemonsqueezy.com) and create a new store.

## 2. Create Products

### Product 1: XPLife Premium

- **Type:** Subscription
- **Name:** XPLife Premium
- **Price:** $4.99/month
- **Description:** Unlimited AI tasks daily, 3 parallel goals, full AI coaching & insights, streak freezes (3/month), priority leaderboard, advanced analytics.
- **Billing period:** Monthly

### Product 2: XPLife Lifetime

- **Type:** One-time payment
- **Name:** XPLife Lifetime
- **Price:** $49.00
- **Description:** Everything in Premium, forever. Founding member badge. Limited to 100 spots.
- **Variant note:** If supported by LemonSqueezy, set the stock/quantity limit to 100 to enforce the "first 100 users" cap.

## 3. Get Checkout URLs

After creating each product:

1. Go to the product page in your LemonSqueezy dashboard
2. Click **Share** or find the **Checkout URL** / **Checkout Link**
3. Copy the URL for each product

## 4. Update the App

Open `lib/constants/pricing.ts` and replace the placeholder URLs:

```ts
premium: {
  checkoutUrl: 'https://your-store.lemonsqueezy.com/checkout/buy/xxxxxxxx',
  // ...
},
lifetime: {
  checkoutUrl: 'https://your-store.lemonsqueezy.com/checkout/buy/yyyyyyyy',
  // ...
},
```

## 5. Optional: Webhook Setup

For server-side payment verification, set up a webhook in LemonSqueezy:

1. Go to **Settings > Webhooks** in your LemonSqueezy dashboard
2. Add your webhook URL: `https://yourdomain.com/api/webhooks/lemonsqueezy`
3. Select events: `order_created`, `subscription_created`, `subscription_updated`
4. Copy the signing secret for server-side verification

## 6. Test

Use LemonSqueezy's test mode to verify the checkout flow before going live.

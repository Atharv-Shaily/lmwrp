# Stripe Payment Setup Instructions for LiveMart

This guide will walk you through setting up Stripe payment integration for your LiveMart project.

## Prerequisites

- A Stripe account (free to create)
- Access to [Stripe Dashboard](https://dashboard.stripe.com/)

## Step-by-Step Instructions

### Step 1: Create a Stripe Account

1. Go to [Stripe.com](https://stripe.com/)
2. Click **"Start now"** or **"Sign up"**
3. Fill in your business information:
   - Email address
   - Password
   - Business name
   - Country
4. Verify your email address
5. Complete your business profile (you can do this later for testing)

### Step 2: Get Your API Keys

1. Log in to your [Stripe Dashboard](https://dashboard.stripe.com/)
2. Make sure you're in **Test mode** (toggle in the top right - should show "Test mode")
3. Go to **"Developers"** → **"API keys"** (or click the "Developers" link in the left sidebar)
4. You'll see two keys:
   - **Publishable key** (starts with `pk_test_...` for test mode)
   - **Secret key** (starts with `sk_test_...` for test mode)
5. Click **"Reveal test key"** to see your Secret key
6. **Copy both keys** - you'll need them for your `.env` file

### Step 3: Add Stripe Keys to Your Project

1. Open your `.env` file in the root directory of your LiveMart project
2. Add or update these lines:

```env
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_WEBHOOK_SECRET=your_webhook_secret_here
```

**Example:**
```env
STRIPE_SECRET_KEY=sk_test_51AbCdEfGhIjKlMnOpQrStUvWxYz1234567890abcdefghijklmnopqrstuvwxyz
STRIPE_PUBLISHABLE_KEY=pk_test_51AbCdEfGhIjKlMnOpQrStUvWxYz1234567890abcdefghijklmnopqrstuvwxyz
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

3. Save the `.env` file

**Note:** The `STRIPE_WEBHOOK_SECRET` will be obtained in Step 5 (Webhook Setup).

### Step 4: Install Required Dependencies

Your project already has the Stripe server-side library installed. However, you need to install the `micro` package for webhook handling (to parse raw request body):

```bash
npm install micro
npm install --save-dev @types/micro
```

**Optional:** If you want to add Stripe Elements for a better payment UI (instead of redirecting to Stripe Checkout), run:

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

**Note:** The webhook handler has been updated to properly handle raw body parsing, which is required for Stripe webhook signature verification.

**Note:** Your current implementation uses Payment Intents, which is the recommended approach. You can either:
- Use Stripe Checkout (redirect-based, easier to implement) - Recommended
- Use Stripe Elements (embedded form, more customization)

### Step 5: Set Up Webhooks (For Production/Testing)

Webhooks allow Stripe to notify your application when payment events occur (like successful payments).

#### For Local Development:

1. Install Stripe CLI (if you haven't already):
   - **Windows**: Download from [Stripe CLI Releases](https://github.com/stripe/stripe-cli/releases)
   - **Mac**: `brew install stripe/stripe-cli/stripe`
   - **Linux**: See [Stripe CLI Installation](https://stripe.com/docs/stripe-cli)

2. Login to Stripe CLI:
   ```bash
   stripe login
   ```

3. Forward webhooks to your local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/payments/webhook
   ```

4. The CLI will display a webhook signing secret (starts with `whsec_...`)
5. Copy this secret and add it to your `.env` file:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_your_secret_from_cli
   ```

#### For Production:

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/) → **"Developers"** → **"Webhooks"**
2. Click **"Add endpoint"**
3. Enter your webhook URL:
   - Production URL: `https://yourdomain.com/api/payments/webhook`
4. Select events to listen to:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Click **"Add endpoint"**
6. Click on the webhook endpoint you just created
7. Click **"Reveal"** next to "Signing secret"
8. Copy the webhook secret (starts with `whsec_...`)
9. Add it to your production environment variables

### Step 6: Test Your Integration

#### Test Mode Cards

Stripe provides test card numbers for testing:

**Successful Payment:**
- Card Number: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., `12/34`)
- CVC: Any 3 digits (e.g., `123`)
- ZIP: Any 5 digits (e.g., `12345`)

**Declined Payment:**
- Card Number: `4000 0000 0000 0002`

**Requires Authentication (3D Secure):**
- Card Number: `4000 0025 0000 3155`

**More test cards:** [Stripe Test Cards](https://stripe.com/docs/testing#cards)

#### Testing Steps:

1. Make sure your development server is running:
   ```bash
   npm run dev
   ```

2. Navigate to your checkout page
3. Add items to cart and proceed to checkout
4. Select "Online Payment" as payment method
5. Use a test card number to complete the payment
6. Check your Stripe Dashboard → **"Payments"** to see the test payment

### Step 7: Complete Frontend Payment Implementation

**Note:** Your current checkout implementation creates a payment intent but doesn't redirect to Stripe Checkout or use Stripe Elements. You have two options:

#### Option A: Use Stripe Checkout (Recommended - Easier)

Stripe Checkout is a pre-built payment page hosted by Stripe. You redirect users to Stripe's hosted checkout page.

**Implementation Steps:**

1. Update your `pages/api/payments/create-intent.ts` to create a Checkout Session instead:

```typescript
// Instead of Payment Intent, create a Checkout Session
const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  line_items: [{
    price_data: {
      currency: 'usd',
      product_data: {
        name: 'Order #' + orderId,
      },
      unit_amount: Math.round(amount * 100),
    },
    quantity: 1,
  }],
  mode: 'payment',
  success_url: `${process.env.NEXTAUTH_URL}/orders/${orderId}?success=true`,
  cancel_url: `${process.env.NEXTAUTH_URL}/checkout?canceled=true`,
  metadata: {
    orderId,
    userId: (session.user as any).id,
  },
});

return res.status(200).json({ sessionId: session.id });
```

2. Update your checkout page to redirect to Stripe Checkout:

```typescript
// In checkout.tsx, after creating the order:
if (data.paymentMethod === 'online') {
  const paymentResponse = await axios.post('/api/payments/create-intent', {
    amount: total,
    orderId: orderResponse.data._id,
  });
  
  // Redirect to Stripe Checkout
  window.location.href = paymentResponse.data.url; // Stripe Checkout URL
}
```

#### Option B: Use Stripe Elements (More Customization)

Stripe Elements allows you to embed a payment form directly in your page.

1. Install the required packages:
   ```bash
   npm install @stripe/stripe-js @stripe/react-stripe-js
   ```

2. Create a payment component with Stripe Elements
3. Use the `clientSecret` from your payment intent to confirm the payment

**See Stripe Documentation:** [Stripe Elements Guide](https://stripe.com/docs/stripe-js/react)

### Step 8: Switch to Live Mode (Production)

When you're ready to accept real payments:

1. In Stripe Dashboard, toggle from **"Test mode"** to **"Live mode"** (top right)
2. Go to **"Developers"** → **"API keys"**
3. Copy your **Live mode** keys:
   - Publishable key (starts with `pk_live_...`)
   - Secret key (starts with `sk_live_...`)
4. Update your production `.env` file with live keys:
   ```env
   STRIPE_SECRET_KEY=sk_live_your_live_secret_key
   STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key
   ```
5. Set up production webhooks (see Step 5)
6. Complete your business profile in Stripe Dashboard
7. Submit for activation (if required in your country)

## Current Implementation Status

Your project currently has:
- ✅ Payment Intent creation API (`/api/payments/create-intent`)
- ✅ Webhook handler for payment events (`/api/payments/webhook`)
- ✅ Order creation with payment integration
- ⚠️ Frontend payment UI needs completion (see Step 7)

## Environment Variables Checklist

Make sure your `.env` file includes:

```env
# Stripe Payment
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Troubleshooting

### Issue: "Invalid API Key" Error

**Solution:**
- Make sure you're using the correct key (test vs live)
- Check for extra spaces or quotes in your `.env` file
- Restart your development server after updating `.env`
- Verify the key starts with `sk_test_` (test) or `sk_live_` (live)

### Issue: Webhook Signature Verification Failed

**Solution:**
- Make sure `STRIPE_WEBHOOK_SECRET` is set correctly
- For local development, use the secret from `stripe listen` command
- For production, use the webhook secret from Stripe Dashboard
- Ensure the webhook endpoint URL matches exactly

### Issue: Payment Intent Not Created

**Solution:**
- Check that `STRIPE_SECRET_KEY` is set in `.env`
- Verify the amount is in the correct format (dollars, will be converted to cents)
- Check server logs for detailed error messages
- Ensure you're authenticated (session exists)

### Issue: Payment Succeeds but Order Not Updated

**Solution:**
- Check webhook is properly configured
- Verify webhook endpoint is accessible
- Check webhook secret is correct
- Review webhook logs in Stripe Dashboard → Developers → Webhooks

### Issue: CORS Errors

**Solution:**
- Make sure your `NEXTAUTH_URL` is set correctly
- For production, ensure your domain is added to Stripe Dashboard → Settings → Domains

## Security Best Practices

1. **Never commit `.env` file** - it should be in `.gitignore` (already configured)
2. **Use different keys** for development and production
3. **Keep Secret Keys secure** - never expose them in client-side code
4. **Always verify webhook signatures** - your code already does this ✅
5. **Use HTTPS in production** - required for Stripe
6. **Validate amounts server-side** - your code already does this ✅
7. **Use Payment Intents** - your code already uses this ✅ (more secure than Charges API)

## Testing Checklist

- [ ] Stripe account created
- [ ] Test mode API keys obtained
- [ ] Keys added to `.env` file
- [ ] Development server restarted
- [ ] Test payment with test card `4242 4242 4242 4242`
- [ ] Payment appears in Stripe Dashboard
- [ ] Webhook configured (for local or production)
- [ ] Order status updates after successful payment
- [ ] Failed payment handled correctly

## Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Next.js + Stripe Integration](https://stripe.com/docs/payments/accept-a-payment?platform=nextjs)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)

## Next Steps

1. Complete the frontend payment implementation (Step 7)
2. Test thoroughly with test cards
3. Set up production webhooks
4. Switch to live mode when ready
5. Monitor payments in Stripe Dashboard

---

**Note:** Your backend is already configured correctly! You just need to:
1. Add your Stripe keys to `.env`
2. Complete the frontend payment flow (redirect to Stripe Checkout or implement Stripe Elements)
3. Set up webhooks for production


# Stripe Paywall Setup Instructions

## 1. Environment Variables

Copy `.env.example` to `.env` and fill in the placeholders:

```ini
OPENAI_API_KEY="YOUR_OPENAI_KEY_HERE"
SUPABASE_URL="https://YOUR_SUPABASE_PROJECT.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="YOUR_SUPABASE_SERVICE_ROLE_KEY"
STRIPE_SECRET_KEY="sk_test_51RjpewPEyzTs9MWEg5IYLeynXAZfYU7sjFb1rNKBv0YKtOp9q1RijTck8YOJVS6crESeKP51rVuimd9mQjNn36fC00EEBfcf8J" # Your Stripe secret key
STRIPE_PRICE_ID="https://buy.stripe.com/test_fZu6oJ9XO5z6cYB2rY53O00" # Your $5 one-time payment price ID
CLIENT_SUCCESS_URL="http://localhost:5173/?session_id={CHECKOUT_SESSION_ID}"
CLIENT_CANCEL_URL="http://localhost:5173/cancel"
VITE_STRIPE_PUBLIC_KEY="pk_test_51RjpewPEyzTs9MWEAE8xHDQeQw6hRbANL7sWm1BzDarjSMINOUSfmeuuts0RmURw0AIdP2BnTX1K7UmIjSpNCVhA00loAuQeoS" # Your Stripe publishable key
```

## 2. Stripe Dashboard Setup

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Create a product with a $5 one-time payment price
3. Copy the price ID (starts with `price_`) to `STRIPE_PRICE_ID`
4. Get your API keys from [API Keys page](https://dashboard.stripe.com/apikeys)

## 3. Testing Instructions

**Use Stripe test keys and test card number: `4242 4242 4242 4242`**

### Testing Flow:
1. Start the application: `npm run dev`
2. Visit http://localhost:5173
3. Click "Unlock Processing – $5"
4. Use test card: `4242 4242 4242 4242`, any future expiry, any CVC
5. Complete payment
6. You'll be redirected back with payment verification
7. Upload a PDF to test processing
8. After CSV generation, payment status resets for next file

### Payment States:
- **Unpaid**: Shows "Unlock Processing – $5" button
- **Paid**: Shows file upload interface
- **After processing**: Resets to unpaid for next file

## 4. Production Setup

1. Replace test keys with live Stripe keys
2. Update success/cancel URLs to your domain
3. Test with real payment methods

## Architecture Notes

- Payment verification happens client-side on page load
- Server validates Stripe sessions on /stripe/verify endpoint
- Payment state resets after each successful CSV generation
- Graceful fallback if Stripe isn't configured (development mode)
# Los Jefes

Modern taco catering website with a live weekend booking estimator, Stripe
deposit checkout, pay-later reservations, contact form, and Discord webhook
alerts.

## Features

- Weekend-only catering reservation form for Saturdays and Sundays
- Dedicated menu page with placeholder meat photos
- Exactly two meat selections from Carne Asada, Chicken, and Al Pastor
- Pricing logic:
  - $25/person for the first 60 guests
  - $20/person for each additional guest after 60
  - $750 flat minimum when fewer than 30 guests are entered
  - 20% deposit calculation
- Pay Now flow using Stripe Checkout
- Pay Later flow with pending-contact messaging
- Discord embeds for catering bookings and general inquiries

## Environment variables

Create `.env.local` from `.env.example` and fill in production values:

```bash
cp .env.example .env.local
```

- `DISCORD_BOOKING_WEBHOOK_URL`: booking operations Discord webhook
- `DISCORD_CONTACT_WEBHOOK_URL`: contact/general inquiry Discord webhook
- `DISCORD_WEBHOOK_URL`: optional fallback used if a specific webhook is not set
- `STRIPE_SECRET_KEY`: Stripe secret key for Checkout Sessions
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook signing secret for payment confirmation
- `NEXT_PUBLIC_SITE_URL`: public site URL used for Stripe success/cancel redirects

Configure Stripe to send `checkout.session.completed` events to:

```text
/api/stripe/webhook
```

## Development

```bash
npm install
npm run dev
```

## Verification

```bash
npm run lint
npm run build
```

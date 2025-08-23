# Stripe Webhook Integration Setup

## Overview

This document provides instructions for setting up and configuring Stripe webhooks for the payment processing system. Webhooks allow Stripe to notify our application when events occur, such as successful payments, failed payments, or completed checkout sessions.

## Prerequisites

- Stripe account
- Stripe CLI (for local testing)
- Access to the application's environment variables

## Configuration Steps

### 1. Set up Stripe Webhook Endpoint

1. Log in to your [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to Developers > Webhooks
3. Click "Add endpoint"
4. Enter your webhook URL: `https://your-domain.com/payments/webhook` (for production) or use Stripe CLI for local development
5. Select events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `checkout.session.completed`
6. Click "Add endpoint"

### 2. Get Webhook Secret

After creating the webhook endpoint, Stripe will provide a signing secret. This is used to verify that webhook events are coming from Stripe.

1. In the webhook details page, click "Reveal" next to "Signing secret"
2. Copy the signing secret

### 3. Configure Environment Variables

Add the webhook secret to your `.env` file:

```
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret_key_here
```

Replace `whsec_your_stripe_webhook_secret_key_here` with the actual signing secret from Stripe.

### 4. Local Testing with Stripe CLI

For local development, you can use the Stripe CLI to forward webhook events to your local server:

1. Install the [Stripe CLI](https://stripe.com/docs/stripe-cli)
2. Login to your Stripe account: `stripe login`
3. Forward events to your local server: `stripe listen --forward-to http://localhost:3030/payments/webhook`
4. The CLI will display a webhook signing secret - use this in your `.env` file during development

## Webhook Events Handled

The application currently handles the following Stripe events:

1. `payment_intent.succeeded`: When a payment is successful
   - Updates order status to PROCESSING
   - Updates payment status to COMPLETED
   - Sends order confirmation email

2. `payment_intent.payment_failed`: When a payment fails
   - Updates order status to PAYMENT_FAILED
   - Updates payment status to FAILED

3. `checkout.session.completed`: When a checkout session is completed
   - Retrieves the payment intent and processes it

## Troubleshooting

### Common Issues

1. **Invalid Signature**: Ensure the correct webhook secret is set in your environment variables
2. **Events Not Being Received**: Check that your webhook endpoint is accessible and that the correct events are selected in the Stripe dashboard
3. **Error Processing Events**: Check the application logs for detailed error messages

### Webhook Logs

You can view webhook delivery attempts and responses in the Stripe Dashboard under Developers > Webhooks > [Your Endpoint] > Logs.

## Security Considerations

- Always verify the signature of incoming webhook events
- Use HTTPS for your webhook endpoint in production
- Keep your webhook secret secure and never commit it to version control

## Additional Resources

- [Stripe Webhooks Documentation](https://stripe.com/docs/webhooks)
- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)
- [Testing Webhooks](https://stripe.com/docs/webhooks/test)
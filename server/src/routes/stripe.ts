import { Hono } from 'hono';
import Stripe from 'stripe';
import { z } from 'zod';
import { getAllowedOrigins, getStripeSecretKey, getStripeWebhookSecret } from '../config.js';
import { isAllowedReturnUrl, isValidAmountCents } from '../validation.js';

const checkoutBodySchema = z.object({
   amountCents: z.number().int().positive(),
   successUrl: z.string().url(),
   cancelUrl: z.string().url(),
   locale: z.enum(['pt', 'en', 'es']).optional(),
});

function getStripeClient(): Stripe | null {
   const secretKey = getStripeSecretKey();
   if (!secretKey) {
      return null;
   }
   return new Stripe(secretKey);
}

export const stripeRoutes = new Hono();

stripeRoutes.post('/create-checkout-session', async (c) => {
   const stripe = getStripeClient();
   if (!stripe) {
      return c.json({ error: 'Stripe is not configured' }, 503);
   }

   const allowedOrigins = getAllowedOrigins();
   if (allowedOrigins.length === 0) {
      return c.json({ error: 'ALLOWED_ORIGINS is not configured' }, 503);
   }

   let body: z.infer<typeof checkoutBodySchema>;
   try {
      const json: unknown = await c.req.json();
      body = checkoutBodySchema.parse(json);
   } catch {
      return c.json({ error: 'Invalid request body' }, 400);
   }

   if (!isValidAmountCents(body.amountCents)) {
      return c.json({ error: 'Invalid donation amount' }, 400);
   }

   if (
      !isAllowedReturnUrl(body.successUrl, allowedOrigins) ||
      !isAllowedReturnUrl(body.cancelUrl, allowedOrigins)
   ) {
      return c.json({ error: 'Return URL origin is not allowed' }, 400);
   }

   const locale = body.locale ?? 'pt';
   const productName =
      locale === 'en'
         ? 'Support Rick and Morty Portal'
         : locale === 'es'
           ? 'Apoyar Rick and Morty Portal'
           : 'Apoiar Rick and Morty Portal';

   try {
      const session = await stripe.checkout.sessions.create({
         mode: 'payment',
         payment_method_types: ['pix'],
         line_items: [
            {
               quantity: 1,
               price_data: {
                  currency: 'brl',
                  unit_amount: body.amountCents,
                  product_data: {
                     name: productName,
                  },
               },
            },
         ],
         success_url: body.successUrl,
         cancel_url: body.cancelUrl,
         payment_method_options: {
            pix: {
               setup_future_usage: 'none',
            },
         },
         metadata: {
            source: 'rick-morty-portal',
            locale,
         },
      });

      if (!session.url) {
         return c.json({ error: 'Checkout session URL missing' }, 502);
      }

      return c.json({ url: session.url });
   } catch (err) {
      console.error('[stripe] create-checkout-session failed', err);
      return c.json({ error: 'Failed to create checkout session' }, 502);
   }
});

stripeRoutes.post('/webhook', async (c) => {
   const stripe = getStripeClient();
   const webhookSecret = getStripeWebhookSecret();

   if (!stripe || !webhookSecret) {
      return c.json({ error: 'Stripe webhook is not configured' }, 503);
   }

   const signature = c.req.header('stripe-signature');
   if (!signature) {
      return c.json({ error: 'Missing stripe-signature header' }, 400);
   }

   const rawBody = await c.req.text();

   let event: Stripe.Event;
   try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
   } catch (err) {
      console.error('[stripe] webhook signature verification failed', err);
      return c.json({ error: 'Invalid webhook signature' }, 400);
   }

   if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      console.info('[stripe] checkout.session.completed', {
         sessionId: session.id,
         amountTotal: session.amount_total,
         currency: session.currency,
         paymentStatus: session.payment_status,
      });
   }

   return c.json({ received: true });
});

export const DONATION_PRESET_CENTS = [1000, 2500, 5000] as const;

export const MIN_DONATION_CENTS = 500;

export const MAX_DONATION_CENTS = 50000;

export const PORT = Number(process.env.PORT ?? 8080);

export function getAllowedOrigins(): string[] {
   const raw = process.env.ALLOWED_ORIGINS?.trim();
   if (!raw) {
      return [];
   }
   return raw
      .split(',')
      .map((origin) => origin.trim().replace(/\/$/, ''))
      .filter(Boolean);
}

export function getStripeSecretKey(): string | null {
   const key = process.env.STRIPE_SECRET_KEY?.trim();
   return key || null;
}

export function getStripeWebhookSecret(): string | null {
   const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
   return secret || null;
}

export function isOriginAllowed(origin: string, allowedOrigins: string[]): boolean {
   const normalized = origin.trim().replace(/\/$/, '');
   return allowedOrigins.some((allowed) => allowed === normalized);
}

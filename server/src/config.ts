export const PORT = Number(process.env.PORT ?? 8080);

export const LLM_BASE_URL =
   process.env.LLM_BASE_URL?.trim() || 'https://api.groq.com/openai/v1';

export const LLM_MODEL =
   process.env.LLM_MODEL?.trim() || 'llama-3.3-70b-versatile';

export const CACHE_TTL_MS = 60 * 60 * 1000;

export function getLlmApiKey(): string | null {
   const key = process.env.LLM_API_KEY?.trim();
   return key || null;
}

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

export function isOriginAllowed(origin: string, allowedOrigins: string[]): boolean {
   const normalized = origin.trim().replace(/\/$/, '');
   return allowedOrigins.some((allowed) => allowed === normalized);
}

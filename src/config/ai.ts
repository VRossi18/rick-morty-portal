const aiApiUrlRaw = import.meta.env.VITE_AI_API_URL?.trim() ?? '';

function looksLikeApiKey(value: string): boolean {
   return /^(sk-(proj-)?|gsk_)[A-Za-z0-9_-]+/.test(value);
}

if (import.meta.env.DEV && aiApiUrlRaw && looksLikeApiKey(aiApiUrlRaw)) {
   console.error(
      '[ai] VITE_AI_API_URL looks like an API key. Use /api/ai/character-curiosity and set LLM_API_KEY in .env for the server.',
   );
}

export const aiApiUrl = aiApiUrlRaw;

export const isAiCuriosityConfigured =
   aiApiUrlRaw.length > 0 && !looksLikeApiKey(aiApiUrlRaw);

export function resolveAiApiUrl(): string | null {
   if (!aiApiUrlRaw) {
      return null;
   }

   if (/^https?:\/\//i.test(aiApiUrlRaw)) {
      return aiApiUrlRaw;
   }

   if (typeof window !== 'undefined') {
      return new URL(aiApiUrlRaw, window.location.origin).href;
   }

   return aiApiUrlRaw;
}

export type CuriosityLocale = 'pt' | 'en' | 'es';

export function normalizeCuriosityLocale(language: string): CuriosityLocale {
   const base = language.split('-')[0];
   if (base === 'en' || base === 'es' || base === 'pt') {
      return base;
   }
   return 'pt';
}

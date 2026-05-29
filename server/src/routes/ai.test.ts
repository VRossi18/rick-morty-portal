import { Hono } from 'hono';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { aiRoutes } from './ai.js';

const mockGenerate = vi.fn();

vi.mock('../services/openaiCharacterCuriosity.js', () => ({
   generateCharacterCuriosity: (...args: unknown[]) => mockGenerate(...args),
}));

function createApp() {
   const app = new Hono();
   app.route('/api/ai', aiRoutes);
   return app;
}

describe('aiRoutes', () => {
   beforeEach(() => {
      mockGenerate.mockReset();
   });

   it('returns 400 for invalid body', async () => {
      const app = createApp();
      const response = await app.request('/api/ai/character-curiosity', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ characterId: -1, locale: 'pt' }),
      });
      expect(response.status).toBe(400);
   });

   it('returns curiosity text on success', async () => {
      mockGenerate.mockResolvedValue({ text: 'Fun fact', cached: false });
      const app = createApp();
      const response = await app.request('/api/ai/character-curiosity', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ characterId: 2, locale: 'pt' }),
      });
      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toEqual({ text: 'Fun fact', cached: false });
   });

   it('returns 503 when LLM is not configured', async () => {
      mockGenerate.mockRejectedValue(new Error('LLM_NOT_CONFIGURED'));
      const app = createApp();
      const response = await app.request('/api/ai/character-curiosity', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ characterId: 2, locale: 'en' }),
      });
      expect(response.status).toBe(503);
   });

   it('returns 429 on rate limit', async () => {
      mockGenerate.mockRejectedValue(new Error('LLM_RATE_LIMIT'));
      const app = createApp();
      const response = await app.request('/api/ai/character-curiosity', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ characterId: 2, locale: 'en' }),
      });
      expect(response.status).toBe(429);
   });
});

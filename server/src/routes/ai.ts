import { Hono } from 'hono';
import { z } from 'zod';
import { generateCharacterCuriosity } from '../services/openaiCharacterCuriosity.js';

const curiosityBodySchema = z.object({
   characterId: z.number().int().positive(),
   locale: z.enum(['pt', 'en', 'es']),
   question: z.string().trim().max(400).optional(),
});

export const aiRoutes = new Hono();

aiRoutes.post('/character-curiosity', async (c) => {
   let body: z.infer<typeof curiosityBodySchema>;
   try {
      const json: unknown = await c.req.json();
      body = curiosityBodySchema.parse(json);
   } catch {
      return c.json({ error: 'Invalid request body' }, 400);
   }

   try {
      const result = await generateCharacterCuriosity({
         characterId: body.characterId,
         locale: body.locale,
         question: body.question,
      });
      return c.json(result);
   } catch (err) {
      const code = err instanceof Error ? err.message : '';
      if (code === 'LLM_NOT_CONFIGURED') {
         return c.json({ error: 'AI service is not configured' }, 503);
      }
      if (code === 'LLM_AUTH_FAILED') {
         return c.json({ error: 'AI service misconfigured' }, 503);
      }
      if (code === 'LLM_QUOTA_EXCEEDED') {
         return c.json({ error: 'AI quota exceeded' }, 503);
      }
      if (code === 'LLM_RATE_LIMIT') {
         return c.json({ error: 'Rate limit exceeded' }, 429);
      }
      if (code === 'CHARACTER_NOT_FOUND') {
         return c.json({ error: 'Character not found' }, 404);
      }
      if (code === 'CHARACTER_FETCH_FAILED') {
         return c.json({ error: 'Failed to load character data' }, 502);
      }
      console.error('[ai] character-curiosity failed', err);
      return c.json({ error: 'Failed to generate curiosity' }, 502);
   }
});

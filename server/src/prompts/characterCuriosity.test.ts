import { describe, expect, it } from 'vitest';
import {
   buildCacheKey,
   buildSystemPrompt,
   buildUserPrompt,
} from './characterCuriosity.js';
import type { ApiCharacter } from '../types/character.js';

const mockCharacter: ApiCharacter = {
   id: 2,
   name: 'Morty Smith',
   status: 'Alive',
   species: 'Human',
   type: '',
   gender: 'Male',
   origin: { name: 'Earth', url: 'https://rickandmortyapi.com/api/location/1' },
   location: { name: 'Earth', url: 'https://rickandmortyapi.com/api/location/20' },
   image: 'https://example.com/morty.jpeg',
   episode: ['https://rickandmortyapi.com/api/episode/1'],
   url: 'https://rickandmortyapi.com/api/character/2',
   created: '2017-11-04T18:50:21.651Z',
};

describe('characterCuriosity prompts', () => {
   it('builds locale-specific system prompt', () => {
      expect(buildSystemPrompt('pt')).toContain('português do Brasil');
      expect(buildSystemPrompt('en')).toContain('English');
   });

   it('builds initial curiosity prompt without question', () => {
      const prompt = buildUserPrompt(mockCharacter, 'pt');
      expect(prompt).toContain('Morty Smith');
      expect(prompt).toContain('curiosidade');
      expect(prompt).not.toContain('User question');
   });

   it('builds follow-up prompt with question', () => {
      const prompt = buildUserPrompt(mockCharacter, 'en', 'Why does he follow Rick?');
      expect(prompt).toContain('User question about this character');
      expect(prompt).toContain('Why does he follow Rick?');
   });

   it('builds stable cache keys', () => {
      expect(buildCacheKey(2, 'pt')).toBe('2:pt:__initial__');
      expect(buildCacheKey(2, 'pt', '  Hello  ')).toBe('2:pt:hello');
   });
});

import type { ApiCharacter, CuriosityLocale } from '../types/character.js';

const LOCALE_LABELS: Record<CuriosityLocale, string> = {
   pt: 'português do Brasil',
   en: 'English',
   es: 'español',
};

export function buildCharacterContext(character: ApiCharacter): string {
   return [
      `Name: ${character.name}`,
      `Status: ${character.status}`,
      `Species: ${character.species}`,
      `Type: ${character.type || 'unknown'}`,
      `Gender: ${character.gender}`,
      `Origin: ${character.origin.name}`,
      `Current location: ${character.location.name}`,
      `Episodes appeared: ${character.episode.length}`,
   ].join('\n');
}

export function buildSystemPrompt(locale: CuriosityLocale): string {
   const language = LOCALE_LABELS[locale];
   return [
      'You are a Rick and Morty fan guide for an educational portal.',
      `Always respond in ${language}.`,
      'Base answers on the Rick and Morty TV show and the character context provided.',
      'If you are unsure, say so briefly instead of inventing canon facts.',
      'Keep answers concise (2-4 sentences), friendly, and spoiler-light.',
      'Do not mention that you are an AI.',
   ].join(' ');
}

export function buildUserPrompt(
   character: ApiCharacter,
   locale: CuriosityLocale,
   question?: string,
): string {
   const context = buildCharacterContext(character);

   if (question?.trim()) {
      return [
         'Character context:',
         context,
         '',
         `User question about this character: ${question.trim()}`,
         'Answer the question using the context and your knowledge of the show.',
      ].join('\n');
   }

   const introByLocale: Record<CuriosityLocale, string> = {
      pt: 'Escreva uma curiosidade curta e interessante sobre este personagem de Rick and Morty.',
      en: 'Write a short, interesting fun fact about this Rick and Morty character.',
      es: 'Escribe una curiosidad breve e interesante sobre este personaje de Rick and Morty.',
   };

   return [introByLocale[locale], '', 'Character context:', context].join('\n');
}

export function buildCacheKey(
   characterId: number,
   locale: CuriosityLocale,
   question?: string,
): string {
   const normalizedQuestion = question?.trim().toLowerCase() || '__initial__';
   return `${characterId}:${locale}:${normalizedQuestion}`;
}

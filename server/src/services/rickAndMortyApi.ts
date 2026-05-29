import type { ApiCharacter } from '../types/character.js';

const API_BASE = 'https://rickandmortyapi.com/api';

export async function fetchCharacterById(characterId: number): Promise<ApiCharacter> {
   const response = await fetch(`${API_BASE}/character/${characterId}`);
   if (response.status === 404) {
      throw new Error('CHARACTER_NOT_FOUND');
   }
   if (!response.ok) {
      throw new Error('CHARACTER_FETCH_FAILED');
   }
   return (await response.json()) as ApiCharacter;
}

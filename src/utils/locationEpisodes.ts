import { CharacterService } from '../services/characters';
import { EpisodeService } from '../services/episodes';
import type { Episode } from '../types/api';
import { characterUrlToId } from './episodeCharacters';
import { episodeUrlToId } from './locationUrls';
import { sortEpisodesByCode } from './episodeSeason';

export function residentUrlsToCharacterIds(residentUrls: string[]): number[] {
   return residentUrls
      .map(characterUrlToId)
      .filter((id): id is number => id !== null);
}

export function uniqueEpisodeIdsFromCharacters(
   characters: { episode: string[] }[],
): number[] {
   const ids = new Set<number>();
   for (const character of characters) {
      for (const url of character.episode) {
         const id = episodeUrlToId(url);
         if (id !== null) {
            ids.add(id);
         }
      }
   }
   return [...ids];
}

export async function collectEpisodeIdsFromResidents(
   residentUrls: string[],
): Promise<number[]> {
   const characterIds = residentUrlsToCharacterIds(residentUrls);
   if (characterIds.length === 0) {
      return [];
   }

   const characters = await CharacterService.getMultipleCharacters(characterIds);
   return uniqueEpisodeIdsFromCharacters(characters);
}

export async function fetchEpisodesByIds(ids: number[]): Promise<Episode[]> {
   if (ids.length === 0) {
      return [];
   }
   const episodes = await EpisodeService.getMultipleEpisodes(ids);
   return sortEpisodesByCode(episodes);
}

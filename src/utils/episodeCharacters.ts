import { EpisodeService, type EpisodeListFilters } from '../services/episodes';
import type { Episode, Info } from '../types/api';

/** Client-side pages when character filter is active (per season). */
export const EPISODES_PAGE_SIZE = 8;

export function characterUrlToId(url: string): number | null {
   const match = url.match(/\/character\/(\d+)$/);
   if (!match) {
      return null;
   }
   const id = Number(match[1]);
   return Number.isFinite(id) && id > 0 ? id : null;
}

export function episodeCharacterIds(episode: Episode): number[] {
   return episode.characters
      .map(characterUrlToId)
      .filter((id): id is number => id !== null);
}

export function episodeIncludesAllCharacters(episode: Episode, characterIds: number[]): boolean {
   if (characterIds.length === 0) {
      return true;
   }
   const inEpisode = new Set(episodeCharacterIds(episode));
   return characterIds.every((id) => inEpisode.has(id));
}

export async function fetchAllEpisodes(filters: EpisodeListFilters = {}): Promise<Episode[]> {
   const first = await EpisodeService.getEpisodes(1, filters);
   const all = [...first.results];

   for (let page = 2; page <= first.info.pages; page++) {
      const data = await EpisodeService.getEpisodes(page, filters);
      all.push(...data.results);
   }

   return all;
}

export function paginateEpisodes(
   episodes: Episode[],
   page: number,
   pageSize = EPISODES_PAGE_SIZE,
): { results: Episode[]; info: Info } {
   const totalPages = Math.max(1, Math.ceil(episodes.length / pageSize));
   const safePage = Math.min(Math.max(1, page), totalPages);
   const start = (safePage - 1) * pageSize;
   const results = episodes.slice(start, start + pageSize);

   return {
      results,
      info: {
         count: episodes.length,
         pages: totalPages,
         next: safePage < totalPages ? 'client-next' : null,
         prev: safePage > 1 ? 'client-prev' : null,
      },
   };
}

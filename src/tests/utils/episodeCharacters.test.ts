import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Episode } from '../../types/api';
import { EpisodeService } from '../../services/episodes';
import {
   characterUrlToId,
   episodeIncludesAllCharacters,
   fetchAllEpisodes,
   paginateEpisodes,
} from '../../utils/episodeCharacters';

vi.mock('../../services/episodes', () => ({
   EpisodeService: {
      getEpisodes: vi.fn(),
   },
}));

const mockedGetEpisodes = vi.mocked(EpisodeService.getEpisodes);

const ep = (id: number, characterIds: number[]): Episode => ({
   id,
   name: `Episode ${id}`,
   air_date: 'January 1, 2014',
   episode: `S01E${String(id).padStart(2, '0')}`,
   characters: characterIds.map((cid) => `https://rickandmortyapi.com/api/character/${cid}`),
   url: '',
   created: '',
});

describe('episodeCharacters utils', () => {
   beforeEach(() => {
      mockedGetEpisodes.mockReset();
   });

   it('characterUrlToId extracts numeric id', () => {
      expect(characterUrlToId('https://rickandmortyapi.com/api/character/42')).toBe(42);
      expect(characterUrlToId('invalid')).toBeNull();
   });

   it('episodeIncludesAllCharacters uses AND logic', () => {
      const episode = ep(1, [1, 2, 3]);
      expect(episodeIncludesAllCharacters(episode, [])).toBe(true);
      expect(episodeIncludesAllCharacters(episode, [99])).toBe(false);
      expect(episodeIncludesAllCharacters(episode, [2, 99])).toBe(false);
      expect(episodeIncludesAllCharacters(episode, [1, 2])).toBe(true);
   });

   it('paginateEpisodes slices and builds info', () => {
      const list = [ep(1, []), ep(2, []), ep(3, [])];
      const page1 = paginateEpisodes(list, 1, 2);
      expect(page1.results).toHaveLength(2);
      expect(page1.info.count).toBe(3);
      expect(page1.info.pages).toBe(2);
      expect(page1.info.next).toBe('client-next');
      expect(page1.info.prev).toBeNull();

      const page2 = paginateEpisodes(list, 2, 2);
      expect(page2.results).toHaveLength(1);
      expect(page2.info.prev).toBe('client-prev');
      expect(page2.info.next).toBeNull();
   });

   it('fetchAllEpisodes loads every page', async () => {
      mockedGetEpisodes
         .mockResolvedValueOnce({
            info: { count: 3, pages: 2, next: 'x', prev: null },
            results: [ep(1, [1])],
         })
         .mockResolvedValueOnce({
            info: { count: 3, pages: 2, next: null, prev: 'y' },
            results: [ep(2, [2])],
         });

      const all = await fetchAllEpisodes();
      expect(all).toHaveLength(2);
      expect(mockedGetEpisodes).toHaveBeenCalledTimes(2);
   });
});

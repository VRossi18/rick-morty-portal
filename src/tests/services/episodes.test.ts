import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ApiResponse, Episode } from '../../types/api';
import api from '../../services/api';
import { EpisodeService } from '../../services/episodes';

vi.mock('../../services/api', () => ({
   default: {
      get: vi.fn(),
   },
}));

const mockedGet = vi.mocked(api.get);

const emptyList: ApiResponse<Episode> = {
   info: { count: 0, pages: 1, next: null, prev: null },
   results: [],
};

describe('EpisodeService', () => {
   beforeEach(() => {
      mockedGet.mockReset();
   });

   it('getEpisodes sends page and name filter', async () => {
      mockedGet.mockResolvedValue({ data: emptyList });
      await EpisodeService.getEpisodes(2, { name: 'Pilot' });
      expect(mockedGet).toHaveBeenCalledWith('/episode', {
         params: { page: 2, name: 'Pilot' },
      });
   });

   it('getEpisodes omits empty filter fields', async () => {
      mockedGet.mockResolvedValue({ data: emptyList });
      await EpisodeService.getEpisodes(1, { name: '   ', episode: '' });
      expect(mockedGet).toHaveBeenCalledWith('/episode', {
         params: { page: 1 },
      });
   });

   it('getMultipleEpisodes requests batched ids', async () => {
      const episodes: Episode[] = [
         {
            id: 1,
            name: 'Pilot',
            air_date: '',
            episode: 'S01E01',
            characters: [],
            url: '',
            created: '',
         },
         {
            id: 2,
            name: 'Lawnmower Dog',
            air_date: '',
            episode: 'S01E02',
            characters: [],
            url: '',
            created: '',
         },
      ];
      mockedGet.mockResolvedValue({ data: episodes });
      const result = await EpisodeService.getMultipleEpisodes([1, 2]);
      expect(mockedGet).toHaveBeenCalledWith('/episode/1,2');
      expect(result).toEqual(episodes);
   });

   it('getMultipleEpisodes fetches chunks in parallel when ids exceed chunk size', async () => {
      const ids = Array.from({ length: 25 }, (_, i) => i + 1);
      const makeEpisode = (id: number): Episode => ({
         id,
         name: `Ep ${id}`,
         air_date: '',
         episode: `S01E${String(id).padStart(2, '0')}`,
         characters: [],
         url: '',
         created: '',
      });

      mockedGet
         .mockResolvedValueOnce({ data: ids.slice(0, 20).map(makeEpisode) })
         .mockResolvedValueOnce({ data: ids.slice(20).map(makeEpisode) });

      const result = await EpisodeService.getMultipleEpisodes(ids);

      expect(mockedGet).toHaveBeenCalledTimes(2);
      expect(result).toHaveLength(25);
   });

   it('getMultipleEpisodes returns empty array for no ids', async () => {
      const result = await EpisodeService.getMultipleEpisodes([]);
      expect(result).toEqual([]);
      expect(mockedGet).not.toHaveBeenCalled();
   });

   it('getEpisodeById requests a single resource path', async () => {
      const episode: Episode = {
         id: 28,
         name: 'The Ricklantis Mixup',
         air_date: 'September 10, 2017',
         episode: 'S03E07',
         characters: [],
         url: '',
         created: '',
      };
      mockedGet.mockResolvedValue({ data: episode });
      const result = await EpisodeService.getEpisodeById(28);
      expect(mockedGet).toHaveBeenCalledWith('/episode/28');
      expect(result).toEqual(episode);
   });
});

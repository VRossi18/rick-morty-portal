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

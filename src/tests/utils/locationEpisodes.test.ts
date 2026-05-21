import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CharacterService } from '../../services/characters';
import {
   collectEpisodeIdsFromResidents,
   uniqueEpisodeIdsFromCharacters,
} from '../../utils/locationEpisodes';

vi.mock('../../services/characters', () => ({
   CharacterService: {
      getMultipleCharacters: vi.fn(),
   },
}));

describe('locationEpisodes', () => {
   beforeEach(() => {
      vi.mocked(CharacterService.getMultipleCharacters).mockReset();
   });

   it('uniqueEpisodeIdsFromCharacters dedupes episode IDs', () => {
      const ids = uniqueEpisodeIdsFromCharacters([
         {
            episode: [
               'https://rickandmortyapi.com/api/episode/1',
               'https://rickandmortyapi.com/api/episode/2',
            ],
         },
         {
            episode: [
               'https://rickandmortyapi.com/api/episode/2',
               'https://rickandmortyapi.com/api/episode/3',
            ],
         },
      ]);
      expect(ids.sort((a, b) => a - b)).toEqual([1, 2, 3]);
   });

   it('collectEpisodeIdsFromResidents fetches characters and merges episodes', async () => {
      vi.mocked(CharacterService.getMultipleCharacters).mockResolvedValue([
         {
            id: 1,
            name: 'Rick',
            status: 'Alive',
            species: 'Human',
            type: '',
            gender: 'Male',
            origin: { name: '', url: '' },
            location: { name: '', url: '' },
            image: '',
            episode: ['https://rickandmortyapi.com/api/episode/5'],
            url: '',
            created: '',
         },
         {
            id: 2,
            name: 'Morty',
            status: 'Alive',
            species: 'Human',
            type: '',
            gender: 'Male',
            origin: { name: '', url: '' },
            location: { name: '', url: '' },
            image: '',
            episode: [
               'https://rickandmortyapi.com/api/episode/5',
               'https://rickandmortyapi.com/api/episode/6',
            ],
            url: '',
            created: '',
         },
      ]);

      const ids = await collectEpisodeIdsFromResidents([
         'https://rickandmortyapi.com/api/character/1',
         'https://rickandmortyapi.com/api/character/2',
      ]);

      expect(CharacterService.getMultipleCharacters).toHaveBeenCalledWith([1, 2]);
      expect(ids.sort((a, b) => a - b)).toEqual([5, 6]);
   });

   it('collectEpisodeIdsFromResidents returns empty for no residents', async () => {
      const ids = await collectEpisodeIdsFromResidents([]);
      expect(ids).toEqual([]);
      expect(CharacterService.getMultipleCharacters).not.toHaveBeenCalled();
   });
});

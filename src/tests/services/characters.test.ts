import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ApiResponse, Character } from '../../types/api';
import api from '../../services/api';
import { CharacterService } from '../../services/characters';

vi.mock('../../services/api', () => ({
   default: {
      get: vi.fn(),
   },
}));

const mockedGet = vi.mocked(api.get);

const emptyList: ApiResponse<Character> = {
   info: { count: 0, pages: 1, next: null, prev: null },
   results: [],
};

describe('CharacterService', () => {
   beforeEach(() => {
      mockedGet.mockReset();
   });

   it('getCharacters sends page and filters with status and gender in lowercase for the API', async () => {
      mockedGet.mockResolvedValue({ data: emptyList });
      await CharacterService.getCharacters(2, {
         name: 'Rick',
         status: 'Alive',
         gender: 'Male',
         species: 'Human',
      });
      expect(mockedGet).toHaveBeenCalledWith('/character', {
         params: { page: 2, name: 'Rick', status: 'alive', gender: 'male', species: 'Human' },
      });
   });

   it('getCharacters omits empty or whitespace-only filter fields', async () => {
      mockedGet.mockResolvedValue({ data: emptyList });
      await CharacterService.getCharacters(1, {
         name: '   ',
         status: '',
         gender: '   ',
         species: '',
         type: '  ',
      });
      expect(mockedGet).toHaveBeenCalledWith('/character', {
         params: { page: 1 },
      });
   });

   it('getCharacterById requests a single resource path', async () => {
      const char: Character = {
         id: 99,
         name: 'Rick',
         status: 'Alive',
         species: 'Human',
         type: '',
         gender: 'Male',
         origin: { name: 'Earth', url: '' },
         location: { name: 'Citadel', url: '' },
         image: '',
         episode: [],
         url: '',
         created: '',
      };
      mockedGet.mockResolvedValue({ data: char });
      const result = await CharacterService.getCharacterById(99);
      expect(mockedGet).toHaveBeenCalledWith('/character/99');
      expect(result).toEqual(char);
   });

   it('getMultipleCharacters joins ids in the path', async () => {
      mockedGet.mockResolvedValue({ data: [] });
      await CharacterService.getMultipleCharacters([1, 2, 3]);
      expect(mockedGet).toHaveBeenCalledWith('/character/1,2,3');
   });

   it('getMultipleCharacters fetches chunks in parallel when ids exceed chunk size', async () => {
      const ids = Array.from({ length: 25 }, (_, i) => i + 1);
      const chunk1 = ids.slice(0, 20).map((id) => ({ id, name: `C${id}` }));
      const chunk2 = ids.slice(20).map((id) => ({ id, name: `C${id}` }));

      mockedGet
         .mockResolvedValueOnce({ data: chunk1 as Character[] })
         .mockResolvedValueOnce({ data: chunk2 as Character[] });

      const result = await CharacterService.getMultipleCharacters(ids);

      expect(mockedGet).toHaveBeenCalledTimes(2);
      expect(mockedGet).toHaveBeenCalledWith(`/character/${ids.slice(0, 20).join(',')}`);
      expect(mockedGet).toHaveBeenCalledWith(`/character/${ids.slice(20).join(',')}`);
      expect(result).toHaveLength(25);
   });

   it('getMultipleCharacters returns empty array for no ids', async () => {
      const result = await CharacterService.getMultipleCharacters([]);
      expect(result).toEqual([]);
      expect(mockedGet).not.toHaveBeenCalled();
   });
});

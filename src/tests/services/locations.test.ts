import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ApiResponse, Location } from '../../types/api';
import api from '../../services/api';
import { LocationService } from '../../services/locations';

vi.mock('../../services/api', () => ({
   default: {
      get: vi.fn(),
   },
}));

const mockedGet = vi.mocked(api.get);

const emptyList: ApiResponse<Location> = {
   info: { count: 0, pages: 1, next: null, prev: null },
   results: [],
};

describe('LocationService', () => {
   beforeEach(() => {
      mockedGet.mockReset();
   });

   it('getLocations sends page and filters', async () => {
      mockedGet.mockResolvedValue({ data: emptyList });
      await LocationService.getLocations(2, {
         name: 'Earth',
         type: 'Planet',
         dimension: 'Dimension C-137',
      });
      expect(mockedGet).toHaveBeenCalledWith('/location', {
         params: {
            page: 2,
            name: 'Earth',
            type: 'Planet',
            dimension: 'Dimension C-137',
         },
      });
   });

   it('getLocations omits empty filter fields', async () => {
      mockedGet.mockResolvedValue({ data: emptyList });
      await LocationService.getLocations(1, { name: '   ', type: '', dimension: '  ' });
      expect(mockedGet).toHaveBeenCalledWith('/location', {
         params: { page: 1 },
      });
   });

   it('getLocationById requests a single resource path', async () => {
      const location: Location = {
         id: 3,
         name: 'Citadel of Ricks',
         type: 'Space station',
         dimension: 'unknown',
         residents: [],
         url: '',
         created: '',
      };
      mockedGet.mockResolvedValue({ data: location });
      const result = await LocationService.getLocationById(3);
      expect(mockedGet).toHaveBeenCalledWith('/location/3');
      expect(result).toEqual(location);
   });
});

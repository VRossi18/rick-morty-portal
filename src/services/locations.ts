import api from './api';
import type { ApiResponse, Location } from '../types/api';

export type LocationListFilters = {
   name?: string;
   type?: string;
   dimension?: string;
};

function toApiParams(page: number, filters: LocationListFilters): Record<string, string | number> {
   const params: Record<string, string | number> = { page };

   const name = filters.name?.trim();
   if (name) {
      params.name = name;
   }

   const type = filters.type?.trim();
   if (type) {
      params.type = type;
   }

   const dimension = filters.dimension?.trim();
   if (dimension) {
      params.dimension = dimension;
   }

   return params;
}

export const LocationService = {
   getLocations: async (
      page: number,
      filters: LocationListFilters = {},
   ): Promise<ApiResponse<Location>> => {
      const params = toApiParams(page, filters);
      const { data } = await api.get<ApiResponse<Location>>('/location', { params });
      return data;
   },

   getLocationById: async (id: number): Promise<Location> => {
      const { data } = await api.get<Location>(`/location/${id}`);
      return data;
   },
};

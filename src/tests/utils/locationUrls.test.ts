import { describe, expect, it } from 'vitest';
import { episodeUrlToId, locationUrlToId } from '../../utils/locationUrls';

describe('locationUrls', () => {
   it('locationUrlToId parses valid location URLs', () => {
      expect(locationUrlToId('https://rickandmortyapi.com/api/location/20')).toBe(20);
   });

   it('locationUrlToId returns null for invalid URLs', () => {
      expect(locationUrlToId('https://rickandmortyapi.com/api/character/1')).toBeNull();
      expect(locationUrlToId('')).toBeNull();
   });

   it('episodeUrlToId parses valid episode URLs', () => {
      expect(episodeUrlToId('https://rickandmortyapi.com/api/episode/28')).toBe(28);
   });

   it('episodeUrlToId returns null for invalid URLs', () => {
      expect(episodeUrlToId('https://rickandmortyapi.com/api/location/1')).toBeNull();
   });
});

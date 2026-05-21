import { describe, expect, it } from 'vitest';
import type { Episode } from '../../types/api';
import {
   EPISODE_SEASONS,
   canGoToNextSeason,
   canGoToPreviousSeason,
   filterEpisodesBySeason,
   parseSeasonFromCode,
   seasonToApiFilter,
   sortEpisodesByCode,
   stepSeason,
} from '../../utils/episodeSeason';

const ep = (id: number, code: string): Episode => ({
   id,
   name: `Ep ${id}`,
   air_date: '',
   episode: code,
   characters: [],
   url: '',
   created: '',
});

describe('episodeSeason utils', () => {
   it('parseSeasonFromCode extracts season number', () => {
      expect(parseSeasonFromCode('S01E01')).toBe(1);
      expect(parseSeasonFromCode('S05E10')).toBe(5);
      expect(parseSeasonFromCode('invalid')).toBeNull();
   });

   it('seasonToApiFilter formats Sxx', () => {
      expect(seasonToApiFilter(1)).toBe('S01');
      expect(seasonToApiFilter(5)).toBe('S05');
   });

   it('filterEpisodesBySeason keeps only matching season', () => {
      const list = [ep(1, 'S01E01'), ep(2, 'S02E01'), ep(3, 'S01E02')];
      const s1 = filterEpisodesBySeason(list, 1);
      expect(s1).toHaveLength(2);
      expect(s1.map((e) => e.id)).toEqual([1, 3]);
   });

   it('sortEpisodesByCode orders by season then episode number', () => {
      const list = [ep(3, 'S01E03'), ep(1, 'S01E01'), ep(2, 'S01E02')];
      expect(sortEpisodesByCode(list).map((e) => e.id)).toEqual([1, 2, 3]);
   });

   it('EPISODE_SEASONS lists seasons 1 through 5', () => {
      expect(EPISODE_SEASONS).toEqual([1, 2, 3, 4, 5]);
   });

   it('stepSeason and canGo helpers respect bounds', () => {
      expect(canGoToPreviousSeason(1)).toBe(false);
      expect(canGoToNextSeason(1)).toBe(true);
      expect(stepSeason(1, 1)).toBe(2);
      expect(canGoToNextSeason(5)).toBe(false);
      expect(stepSeason(5, -1)).toBe(4);
   });
});

import { describe, expect, it } from 'vitest';
import {
   SPECIES_FILTER_OPTIONS,
   TYPE_FILTER_OPTIONS,
} from '../../data/characterFilterOptions';

describe('characterFilterOptions', () => {
   it('exposes non-empty unique species and type lists', () => {
      expect(SPECIES_FILTER_OPTIONS.length).toBeGreaterThan(0);
      expect(TYPE_FILTER_OPTIONS.length).toBeGreaterThan(0);
      expect(new Set(SPECIES_FILTER_OPTIONS).size).toBe(SPECIES_FILTER_OPTIONS.length);
      expect(new Set(TYPE_FILTER_OPTIONS).size).toBe(TYPE_FILTER_OPTIONS.length);
   });
});

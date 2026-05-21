import { describe, expect, it } from 'vitest';
import { API_CHUNK_SIZE, chunkArray } from '../../utils/apiChunks';

describe('apiChunks', () => {
   it('chunkArray splits items by size', () => {
      const items = Array.from({ length: 25 }, (_, i) => i + 1);
      const chunks = chunkArray(items, API_CHUNK_SIZE);
      expect(chunks).toHaveLength(2);
      expect(chunks[0]).toHaveLength(20);
      expect(chunks[1]).toHaveLength(5);
   });

   it('chunkArray returns empty for no items', () => {
      expect(chunkArray([])).toEqual([]);
   });
});

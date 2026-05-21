export const API_CHUNK_SIZE = 20;

export function chunkArray<T>(items: T[], size = API_CHUNK_SIZE): T[][] {
   if (items.length === 0) {
      return [];
   }
   const chunks: T[][] = [];
   for (let i = 0; i < items.length; i += size) {
      chunks.push(items.slice(i, i + size));
   }
   return chunks;
}

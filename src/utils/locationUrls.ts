export function locationUrlToId(url: string): number | null {
   const match = url.match(/\/location\/(\d+)$/);
   if (!match) {
      return null;
   }
   const id = Number(match[1]);
   return Number.isFinite(id) && id > 0 ? id : null;
}

export function episodeUrlToId(url: string): number | null {
   const match = url.match(/\/episode\/(\d+)$/);
   if (!match) {
      return null;
   }
   const id = Number(match[1]);
   return Number.isFinite(id) && id > 0 ? id : null;
}

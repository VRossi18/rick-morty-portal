export function formatLocaleDate(iso: string, locale: string): string {
   try {
      return new Date(iso).toLocaleString(locale);
   } catch {
      return iso;
   }
}

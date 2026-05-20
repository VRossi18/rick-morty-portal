import { useTranslation } from 'react-i18next';
import {
   CharacterMultiSelect,
   type SelectedCharacter,
} from './CharacterMultiSelect';

interface EpisodeFiltersBarProps {
   nameDraft: string;
   onNameDraftChange: (value: string) => void;
   selectedCharacters: SelectedCharacter[];
   onSelectedCharactersChange: (value: SelectedCharacter[]) => void;
   onClearFilters: () => void;
   hasActiveFilters: boolean;
}

export function EpisodeFiltersBar({
   nameDraft,
   onNameDraftChange,
   selectedCharacters,
   onSelectedCharactersChange,
   onClearFilters,
   hasActiveFilters,
}: EpisodeFiltersBarProps) {
   const { t } = useTranslation('common');

   return (
      <div className="mx-auto mb-10 max-w-5xl space-y-4">
         <div className="space-y-2">
            <label htmlFor="episode-search" className="sr-only">
               {t('episodes.filters.searchLabel')}
            </label>
            <input
               id="episode-search"
               type="search"
               value={nameDraft}
               onChange={(e) => onNameDraftChange(e.target.value)}
               placeholder={t('episodes.filters.searchPlaceholder')}
               autoComplete="off"
               className="w-full rounded-xl border border-primary/40 bg-[var(--bg-color)] px-4 py-3 text-sm font-medium text-[var(--text-color)] shadow-sm outline-none ring-primary/30 transition placeholder:text-muted-foreground focus:border-primary focus:ring-2"
            />
         </div>

         <CharacterMultiSelect
            selected={selectedCharacters}
            onChange={onSelectedCharactersChange}
         />

         {hasActiveFilters ? (
            <div className="flex justify-end">
               <button
                  type="button"
                  onClick={onClearFilters}
                  className="rounded-lg border border-primary/40 px-4 py-2 text-sm font-semibold text-primary transition hover:border-primary hover:bg-primary/10"
               >
                  {t('episodes.filters.clear')}
               </button>
            </div>
         ) : null}
      </div>
   );
}

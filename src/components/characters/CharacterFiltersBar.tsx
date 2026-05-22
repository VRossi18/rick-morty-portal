import { useTranslation } from 'react-i18next';
import { SPECIES_FILTER_OPTIONS, TYPE_FILTER_OPTIONS } from '../../data/characterFilterOptions';

interface CharacterFiltersBarProps {
   nameDraft: string;
   onNameDraftChange: (value: string) => void;
   status: string;
   onStatusChange: (value: string) => void;
   gender: string;
   onGenderChange: (value: string) => void;
   species: string;
   onSpeciesChange: (value: string) => void;
   type: string;
   onTypeChange: (value: string) => void;
   onClearFilters: () => void;
   hasActiveFilters: boolean;
}

const selectClassName =
   'min-w-[8.5rem] flex-1 rounded-lg border border-primary/40 bg-[var(--bg-color)] px-3 py-2 text-sm font-semibold text-[var(--text-color)] outline-none ring-primary/30 focus:border-primary focus:ring-2 sm:flex-none';

export function CharacterFiltersBar({
   nameDraft,
   onNameDraftChange,
   status,
   onStatusChange,
   gender,
   onGenderChange,
   species,
   onSpeciesChange,
   type,
   onTypeChange,
   onClearFilters,
   hasActiveFilters,
}: CharacterFiltersBarProps) {
   const { t } = useTranslation('common');

   return (
      <div className="mx-auto mb-10 max-w-5xl space-y-4">
         <div className="space-y-2">
            <label htmlFor="character-search" className="sr-only">
               {t('filters.searchLabel')}
            </label>
            <input
               id="character-search"
               type="search"
               value={nameDraft}
               onChange={(e) => onNameDraftChange(e.target.value)}
               placeholder={t('filters.searchPlaceholder')}
               autoComplete="off"
               className="w-full rounded-xl border border-primary/40 bg-[var(--bg-color)] px-4 py-3 text-sm font-medium text-[var(--text-color)] shadow-sm outline-none ring-primary/30 transition placeholder:text-muted-foreground focus:border-primary focus:ring-2"
            />
         </div>

         <div className="flex flex-wrap items-center gap-3">
            <label className="sr-only" htmlFor="filter-status">
               {t('filters.statusLabel')}
            </label>
            <select
               id="filter-status"
               value={status}
               onChange={(e) => onStatusChange(e.target.value)}
               className={selectClassName}
            >
               <option value="">{t('filters.statusAll')}</option>
               <option value="alive">Alive</option>
               <option value="dead">Dead</option>
               <option value="unknown">Unknown</option>
            </select>

            <label className="sr-only" htmlFor="filter-gender">
               {t('filters.genderLabel')}
            </label>
            <select
               id="filter-gender"
               value={gender}
               onChange={(e) => onGenderChange(e.target.value)}
               className={`${selectClassName} min-w-[9.5rem]`}
            >
               <option value="">{t('filters.genderAll')}</option>
               <option value="female">Female</option>
               <option value="male">Male</option>
               <option value="genderless">Genderless</option>
               <option value="unknown">Unknown</option>
            </select>

            <label className="sr-only" htmlFor="filter-species">
               {t('filters.species')}
            </label>
            <select
               id="filter-species"
               value={species}
               onChange={(e) => onSpeciesChange(e.target.value)}
               className={`${selectClassName} min-w-[10rem]`}
            >
               <option value="">{t('filters.speciesAll')}</option>
               {SPECIES_FILTER_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                     {option}
                  </option>
               ))}
            </select>

            <label className="sr-only" htmlFor="filter-type">
               {t('filters.type')}
            </label>
            <select
               id="filter-type"
               value={type}
               onChange={(e) => onTypeChange(e.target.value)}
               className={`${selectClassName} min-w-[10rem] max-w-[14rem]`}
            >
               <option value="">{t('filters.typeAll')}</option>
               {TYPE_FILTER_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                     {option}
                  </option>
               ))}
            </select>

            <button
               type="button"
               onClick={onClearFilters}
               disabled={!hasActiveFilters}
               className="rounded-lg border border-border px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
            >
               {t('filters.clear')}
            </button>
         </div>
      </div>
   );
}

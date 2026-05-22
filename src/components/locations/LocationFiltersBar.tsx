import { useTranslation } from 'react-i18next';
import {
   LOCATION_DIMENSION_FILTER_OPTIONS,
   LOCATION_TYPE_FILTER_OPTIONS,
} from '../../data/locationFilterOptions';

interface LocationFiltersBarProps {
   nameDraft: string;
   onNameDraftChange: (value: string) => void;
   type: string;
   onTypeChange: (value: string) => void;
   dimension: string;
   onDimensionChange: (value: string) => void;
   onClearFilters: () => void;
   hasActiveFilters: boolean;
}

const selectClassName =
   'min-w-[8.5rem] flex-1 rounded-lg border border-primary/40 bg-[var(--bg-color)] px-3 py-2 text-sm font-semibold text-[var(--text-color)] outline-none ring-primary/30 focus:border-primary focus:ring-2 sm:flex-none';

export function LocationFiltersBar({
   nameDraft,
   onNameDraftChange,
   type,
   onTypeChange,
   dimension,
   onDimensionChange,
   onClearFilters,
   hasActiveFilters,
}: LocationFiltersBarProps) {
   const { t } = useTranslation('common');

   return (
      <div className="mx-auto mb-10 max-w-5xl space-y-4">
         <div className="space-y-2">
            <label htmlFor="location-search" className="sr-only">
               {t('locations.filters.searchLabel')}
            </label>
            <input
               id="location-search"
               type="search"
               value={nameDraft}
               onChange={(e) => onNameDraftChange(e.target.value)}
               placeholder={t('locations.filters.searchPlaceholder')}
               autoComplete="off"
               className="w-full rounded-xl border border-primary/40 bg-[var(--bg-color)] px-4 py-3 text-sm font-medium text-[var(--text-color)] shadow-sm outline-none ring-primary/30 transition placeholder:text-muted-foreground focus:border-primary focus:ring-2"
            />
         </div>

         <div className="flex flex-wrap items-center gap-3">
            <label className="sr-only" htmlFor="filter-location-type">
               {t('locations.filters.typeLabel')}
            </label>
            <select
               id="filter-location-type"
               value={type}
               onChange={(e) => onTypeChange(e.target.value)}
               className={`${selectClassName} min-w-[10rem] max-w-[14rem]`}
            >
               <option value="">{t('locations.filters.typeAll')}</option>
               {LOCATION_TYPE_FILTER_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                     {option}
                  </option>
               ))}
            </select>

            <label className="sr-only" htmlFor="filter-location-dimension">
               {t('locations.filters.dimensionLabel')}
            </label>
            <select
               id="filter-location-dimension"
               value={dimension}
               onChange={(e) => onDimensionChange(e.target.value)}
               className={`${selectClassName} min-w-[10rem] max-w-[16rem]`}
            >
               <option value="">{t('locations.filters.dimensionAll')}</option>
               {LOCATION_DIMENSION_FILTER_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                     {option}
                  </option>
               ))}
            </select>

            {hasActiveFilters ? (
               <button
                  type="button"
                  onClick={onClearFilters}
                  className="rounded-lg border border-primary/40 px-4 py-2 text-sm font-semibold text-primary transition hover:border-primary hover:bg-primary/10"
               >
                  {t('locations.filters.clear')}
               </button>
            ) : null}
         </div>
      </div>
   );
}

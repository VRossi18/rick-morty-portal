import { isAxiosError } from 'axios';
import { motion } from 'framer-motion';
import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { LocationCard } from '../components/locations/LocationCard';
import { LocationFiltersBar } from '../components/locations/LocationFiltersBar';
import { LocationsHero } from '../components/locations/LocationsHero';
import { LocationService, type LocationListFilters } from '../services/locations';
import type { Info, Location } from '../types/api';

const emptyInfo: Info = { count: 0, pages: 1, next: null, prev: null };

export function LocationsPage() {
   const { t } = useTranslation('common');
   const [locations, setLocations] = useState<Location[]>([]);
   const [loading, setLoading] = useState(true);
   const [page, setPage] = useState(1);
   const [pageInfo, setPageInfo] = useState<Info | null>(null);
   const [error, setError] = useState<string | null>(null);
   const [transitionFocusId, setTransitionFocusId] = useState<number | null>(null);

   const [nameDraft, setNameDraft] = useState('');
   const [appliedName, setAppliedName] = useState('');
   const lastCommittedName = useRef('');

   const [type, setType] = useState('');
   const [dimension, setDimension] = useState('');

   const hasActiveFilters = useMemo(
      () => nameDraft.trim() !== '' || type !== '' || dimension !== '',
      [nameDraft, type, dimension],
   );

   const clearAllFilters = useCallback(() => {
      lastCommittedName.current = '';
      setNameDraft('');
      setAppliedName('');
      setType('');
      setDimension('');
      setPage(1);
   }, []);

   const handleTypeChange = useCallback((value: string) => {
      setType(value);
      setPage(1);
   }, []);

   const handleDimensionChange = useCallback((value: string) => {
      setDimension(value);
      setPage(1);
   }, []);

   useEffect(() => {
      const id = window.setTimeout(() => {
         const next = nameDraft.trim();
         if (lastCommittedName.current !== next) {
            lastCommittedName.current = next;
            startTransition(() => {
               setAppliedName(next);
               setPage(1);
            });
         }
      }, 380);
      return () => window.clearTimeout(id);
   }, [nameDraft]);

   const listFilters: LocationListFilters = useMemo(
      () => ({
         ...(appliedName ? { name: appliedName } : {}),
         ...(type ? { type } : {}),
         ...(dimension ? { dimension } : {}),
      }),
      [appliedName, type, dimension],
   );

   useEffect(() => {
      let isMounted = true;

      const loadData = async () => {
         setLoading(true);
         setError(null);

         try {
            const data = await LocationService.getLocations(page, listFilters);

            if (!isMounted) {
               return;
            }

            startTransition(() => {
               setLocations(data.results);
               setPageInfo(data.info);
            });
         } catch (err) {
            if (!isMounted) {
               return;
            }

            if (isAxiosError(err) && err.response?.status === 404) {
               startTransition(() => {
                  setLocations([]);
                  setPageInfo(emptyInfo);
                  setError(null);
               });
            } else {
               console.error('Erro ao carregar localizações:', err);
               startTransition(() => {
                  setError(t('locations.errorLoad'));
               });
            }
         } finally {
            if (isMounted) {
               startTransition(() => {
                  setLoading(false);
               });
            }
         }
      };

      void loadData();

      return () => {
         isMounted = false;
      };
   }, [page, listFilters, t]);

   const handleBeforeNavigate = useCallback((id: number) => {
      flushSync(() => {
         setTransitionFocusId(id);
      });
   }, []);

   const goToPreviousPage = useCallback(() => {
      if (pageInfo?.prev) {
         startTransition(() => {
            setPage((currentPage) => currentPage - 1);
         });
      }
   }, [pageInfo?.prev]);

   const goToNextPage = useCallback(() => {
      if (pageInfo?.next) {
         startTransition(() => {
            setPage((currentPage) => currentPage + 1);
         });
      }
   }, [pageInfo?.next]);

   const showEmptyResults = !loading && !error && locations.length === 0;

   return (
      <motion.div
         className="min-h-screen bg-[var(--bg-color)] transition-colors duration-300"
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         exit={{ opacity: 0 }}
         transition={{ duration: 0.28, ease: 'easeOut' }}
      >
         <LocationsHero />
         <main className="mx-auto max-w-[1400px] px-6 pb-20">
            <LocationFiltersBar
               nameDraft={nameDraft}
               onNameDraftChange={setNameDraft}
               type={type}
               onTypeChange={handleTypeChange}
               dimension={dimension}
               onDimensionChange={handleDimensionChange}
               hasActiveFilters={hasActiveFilters}
               onClearFilters={clearAllFilters}
            />

            <div className="relative min-h-[20rem]">
               {error ? (
                  <div className="flex h-80 items-center justify-center">
                     <p className="text-sm font-bold text-red-500">{error}</p>
                  </div>
               ) : showEmptyResults ? (
                  <div className="flex min-h-[16rem] flex-col items-center justify-center gap-2 px-4 text-center">
                     <p className="text-base font-semibold text-[var(--text-color)]">
                        {t('locations.empty.title')}
                     </p>
                     <p className="max-w-md text-sm text-muted-foreground">
                        {t('locations.empty.hint')}
                     </p>
                  </div>
               ) : (
                  <div
                     className={`grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3 ${loading ? 'pointer-events-none opacity-45' : ''}`}
                  >
                     {locations.map((loc) => {
                        const interaction =
                           transitionFocusId === null
                              ? 'normal'
                              : transitionFocusId === loc.id
                                ? 'source'
                                : 'dimmed';
                        return (
                           <LocationCard
                              key={loc.id}
                              location={loc}
                              interaction={interaction}
                              onBeforeNavigate={handleBeforeNavigate}
                           />
                        );
                     })}
                  </div>
               )}

               {loading ? (
                  <div
                     className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 rounded-xl bg-[var(--bg-color)]/75 backdrop-blur-[2px]"
                     aria-busy="true"
                     aria-live="polite"
                  >
                     <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                     <p className="animate-pulse text-sm font-bold text-primary">
                        {t('locations.loading')}
                     </p>
                  </div>
               ) : null}
            </div>
         </main>
         <footer className="flex items-center justify-center gap-4 pb-8">
            <button
               type="button"
               onClick={goToPreviousPage}
               disabled={!pageInfo?.prev || loading}
               className="rounded-md border border-primary/40 px-4 py-2 text-sm font-semibold text-[var(--text-color)] transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
               {t('locations.pagination.prev')}
            </button>

            <span className="text-sm font-semibold text-[var(--text-color)]">
               {t('locations.pagination.pageOf', { current: page, total: pageInfo?.pages ?? 1 })}
            </span>

            <button
               type="button"
               onClick={goToNextPage}
               disabled={!pageInfo?.next || loading}
               className="rounded-md border border-primary/40 px-4 py-2 text-sm font-semibold text-[var(--text-color)] transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
               {t('locations.pagination.next')}
            </button>
         </footer>
      </motion.div>
   );
}

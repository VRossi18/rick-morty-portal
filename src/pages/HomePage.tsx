import { isAxiosError } from 'axios';
import { motion } from 'framer-motion';
import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { CharacterCard } from '../components/characters/CharacterCard';
import { CharacterFiltersBar } from '../components/characters/CharacterFiltersBar';
import { HomeHero } from '../components/characters/HomeHero';
import { CharacterService, type CharacterListFilters } from '../services/characters';
import type { Character, Info } from '../types/api';

const emptyInfo: Info = { count: 0, pages: 1, next: null, prev: null };

export function HomePage() {
   const { t } = useTranslation('common');
   const [characters, setCharacters] = useState<Character[]>([]);
   const [loading, setLoading] = useState(true);
   const [page, setPage] = useState(1);
   const [pageInfo, setPageInfo] = useState<Info | null>(null);
   const [error, setError] = useState<string | null>(null);
   const [transitionFocusId, setTransitionFocusId] = useState<number | null>(null);

   const [nameDraft, setNameDraft] = useState('');
   const [appliedName, setAppliedName] = useState('');
   const lastCommittedName = useRef('');

   const [status, setStatus] = useState('');
   const [gender, setGender] = useState('');
   const [species, setSpecies] = useState('');
   const [type, setType] = useState('');

   const hasActiveFilters = useMemo(
      () =>
         nameDraft.trim() !== '' ||
         status !== '' ||
         gender !== '' ||
         species.trim() !== '' ||
         type.trim() !== '',
      [nameDraft, status, gender, species, type],
   );

   const clearAllFilters = useCallback(() => {
      lastCommittedName.current = '';
      setNameDraft('');
      setAppliedName('');
      setStatus('');
      setGender('');
      setSpecies('');
      setType('');
      setPage(1);
   }, []);

   const handleStatusChange = useCallback((v: string) => {
      setStatus(v);
      setPage(1);
   }, []);

   const handleGenderChange = useCallback((v: string) => {
      setGender(v);
      setPage(1);
   }, []);

   const handleSpeciesChange = useCallback((v: string) => {
      setSpecies(v);
      setPage(1);
   }, []);

   const handleTypeChange = useCallback((v: string) => {
      setType(v);
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

   const listFilters: CharacterListFilters = useMemo(
      () => ({
         ...(appliedName ? { name: appliedName } : {}),
         ...(status ? { status } : {}),
         ...(gender ? { gender } : {}),
         ...(species.trim() ? { species: species.trim() } : {}),
         ...(type.trim() ? { type: type.trim() } : {}),
      }),
      [appliedName, status, gender, species, type],
   );

   useEffect(() => {
      let isMounted = true;

      const loadData = async () => {
         setLoading(true);
         setError(null);

         try {
            const data = await CharacterService.getCharacters(page, listFilters);

            if (!isMounted) {
               return;
            }

            startTransition(() => {
               setCharacters(data.results);
               setPageInfo(data.info);
            });
         } catch (err) {
            if (!isMounted) {
               return;
            }

            if (isAxiosError(err) && err.response?.status === 404) {
               startTransition(() => {
                  setCharacters([]);
                  setPageInfo(emptyInfo);
                  setError(null);
               });
            } else {
               console.error('Erro ao carregar personagens:', err);
               startTransition(() => {
                  setError(t('home.errorLoad'));
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

   const showEmptyResults = !loading && !error && characters.length === 0;

   return (
      <motion.div
         className="min-h-screen bg-[var(--bg-color)] transition-colors duration-300"
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         exit={{ opacity: 0 }}
         transition={{ duration: 0.28, ease: 'easeOut' }}
      >
         <HomeHero />
         <main className="mx-auto max-w-[1400px] px-6 pb-20">
            <CharacterFiltersBar
               nameDraft={nameDraft}
               onNameDraftChange={setNameDraft}
               status={status}
               onStatusChange={handleStatusChange}
               gender={gender}
               onGenderChange={handleGenderChange}
               species={species}
               onSpeciesChange={handleSpeciesChange}
               type={type}
               onTypeChange={handleTypeChange}
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
                        {t('home.empty.title')}
                     </p>
                     <p className="max-w-md text-sm text-muted-foreground">
                        {t('home.empty.hint')}
                     </p>
                  </div>
               ) : (
                  <div
                     className={`character-grid grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 ${loading ? 'pointer-events-none opacity-45' : ''}`}
                  >
                     {characters.map((char) => {
                        const interaction =
                           transitionFocusId === null
                              ? 'normal'
                              : transitionFocusId === char.id
                                ? 'source'
                                : 'dimmed';
                        return (
                           <CharacterCard
                              key={char.id}
                              character={char}
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
                        {t('home.loading')}
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
               {t('home.pagination.prev')}
            </button>

            <span className="text-sm font-semibold text-[var(--text-color)]">
               {t('home.pagination.pageOf', { current: page, total: pageInfo?.pages ?? 1 })}
            </span>

            <button
               type="button"
               onClick={goToNextPage}
               disabled={!pageInfo?.next || loading}
               className="rounded-md border border-primary/40 px-4 py-2 text-sm font-semibold text-[var(--text-color)] transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
               {t('home.pagination.next')}
            </button>
         </footer>
      </motion.div>
   );
}

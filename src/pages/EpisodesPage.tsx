import { isAxiosError } from 'axios';
import { motion } from 'framer-motion';
import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { useTranslation } from 'react-i18next';
import type { SelectedCharacter } from '../components/episodes/CharacterMultiSelect';
import { EpisodeCard } from '../components/episodes/EpisodeCard';
import { EpisodeFiltersBar } from '../components/episodes/EpisodeFiltersBar';
import { EpisodesHero } from '../components/episodes/EpisodesHero';
import { EpisodeService, type EpisodeListFilters } from '../services/episodes';
import type { Episode, Info } from '../types/api';
import {
   episodeIncludesAllCharacters,
   fetchAllEpisodes,
   paginateEpisodes,
} from '../utils/episodeCharacters';
import {
   filterEpisodesBySeason,
   seasonToApiFilter,
   sortEpisodesByCode,
} from '../utils/episodeSeason';

const emptyInfo: Info = { count: 0, pages: 1, next: null, prev: null };

const DEFAULT_SEASON = 1;

export function EpisodesPage() {
   const { t } = useTranslation('common');
   const [episodes, setEpisodes] = useState<Episode[]>([]);
   const [loading, setLoading] = useState(true);
   const [page, setPage] = useState(1);
   const [pageInfo, setPageInfo] = useState<Info | null>(null);
   const [error, setError] = useState<string | null>(null);
   const [transitionFocusId, setTransitionFocusId] = useState<number | null>(null);

   const [season, setSeason] = useState(DEFAULT_SEASON);
   const [nameDraft, setNameDraft] = useState('');
   const [appliedName, setAppliedName] = useState('');
   const lastCommittedName = useRef('');

   const [selectedCharacters, setSelectedCharacters] = useState<SelectedCharacter[]>([]);

   const selectedCharacterIds = useMemo(
      () => selectedCharacters.map((c) => c.id),
      [selectedCharacters],
   );

   const hasActiveFilters = useMemo(
      () => nameDraft.trim() !== '' || selectedCharacters.length > 0,
      [nameDraft, selectedCharacters.length],
   );

   const clearAllFilters = useCallback(() => {
      lastCommittedName.current = '';
      setNameDraft('');
      setAppliedName('');
      setSelectedCharacters([]);
      setPage(1);
   }, []);

   const handleSeasonChange = useCallback((value: number) => {
      setSeason(value);
      setPage(1);
   }, []);

   const handleSelectedCharactersChange = useCallback((next: SelectedCharacter[]) => {
      setSelectedCharacters(next);
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

   const listFilters: EpisodeListFilters = useMemo(
      () => ({
         episode: seasonToApiFilter(season),
         ...(appliedName ? { name: appliedName } : {}),
      }),
      [appliedName, season],
   );

   useEffect(() => {
      let isMounted = true;

      const loadData = async () => {
         setLoading(true);
         setError(null);

         try {
            if (selectedCharacterIds.length > 0) {
               const all = await fetchAllEpisodes(
                  appliedName ? { name: appliedName } : {},
               );
               const forSeason = filterEpisodesBySeason(all, season);
               const filtered = forSeason.filter((ep) =>
                  episodeIncludesAllCharacters(ep, selectedCharacterIds),
               );
               const sorted = sortEpisodesByCode(filtered);
               const paged = paginateEpisodes(sorted, page);

               if (!isMounted) return;

               startTransition(() => {
                  setEpisodes(paged.results);
                  setPageInfo(paged.info);
               });
            } else {
               const data = await EpisodeService.getEpisodes(page, listFilters);

               if (!isMounted) return;

               startTransition(() => {
                  setEpisodes(sortEpisodesByCode(data.results));
                  setPageInfo(data.info);
               });
            }
         } catch (err) {
            if (!isMounted) return;

            if (isAxiosError(err) && err.response?.status === 404) {
               startTransition(() => {
                  setEpisodes([]);
                  setPageInfo(emptyInfo);
                  setError(null);
               });
            } else {
               console.error('Erro ao carregar episódios:', err);
               startTransition(() => {
                  setError(t('episodes.errorLoad'));
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
   }, [page, listFilters, selectedCharacterIds, season, appliedName, t]);

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

   const showEmptyResults = !loading && !error && episodes.length === 0;

   return (
      <motion.div
         className="min-h-screen bg-[var(--bg-color)] transition-colors duration-300"
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         exit={{ opacity: 0 }}
         transition={{ duration: 0.28, ease: 'easeOut' }}
      >
         <EpisodesHero />
         <main className="mx-auto max-w-[1400px] px-6 pb-20">
            <EpisodeFiltersBar
               season={season}
               onSeasonChange={handleSeasonChange}
               nameDraft={nameDraft}
               onNameDraftChange={setNameDraft}
               selectedCharacters={selectedCharacters}
               onSelectedCharactersChange={handleSelectedCharactersChange}
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
                        {t('episodes.empty.title')}
                     </p>
                     <p className="max-w-md text-sm text-muted-foreground">
                        {t('episodes.empty.hint')}
                     </p>
                  </div>
               ) : (
                  <div
                     className={`grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3 ${loading ? 'pointer-events-none opacity-45' : ''}`}
                  >
                     {episodes.map((ep) => {
                        const interaction =
                           transitionFocusId === null
                              ? 'normal'
                              : transitionFocusId === ep.id
                                ? 'source'
                                : 'dimmed';
                        return (
                           <EpisodeCard
                              key={ep.id}
                              episode={ep}
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
                        {t('episodes.loading')}
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
               {t('episodes.pagination.prev')}
            </button>

            <span className="text-sm font-semibold text-[var(--text-color)]">
               {t('episodes.pagination.pageOfSeason', {
                  season,
                  current: page,
                  total: pageInfo?.pages ?? 1,
               })}
            </span>

            <button
               type="button"
               onClick={goToNextPage}
               disabled={!pageInfo?.next || loading}
               className="rounded-md border border-primary/40 px-4 py-2 text-sm font-semibold text-[var(--text-color)] transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
               {t('episodes.pagination.next')}
            </button>
         </footer>
      </motion.div>
   );
}

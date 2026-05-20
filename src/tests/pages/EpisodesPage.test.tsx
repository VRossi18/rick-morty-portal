import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import i18n from '../../i18n';
import type { ApiResponse, Episode } from '../../types/api';
import { CharacterService } from '../../services/characters';
import { EpisodeService } from '../../services/episodes';
import { EpisodesPage } from '../../pages/EpisodesPage';

vi.mock('../../services/episodes', () => ({
   EpisodeService: {
      getEpisodes: vi.fn(),
   },
}));

vi.mock('../../services/characters', () => ({
   CharacterService: {
      getCharacters: vi.fn(),
   },
}));

const mockedGetEpisodes = vi.mocked(EpisodeService.getEpisodes);
const mockedGetCharacters = vi.mocked(CharacterService.getCharacters);

const sampleEpisode: Episode = {
   id: 1,
   name: 'Pilot',
   air_date: 'December 2, 2013',
   episode: 'S01E01',
   characters: ['https://rickandmortyapi.com/api/character/1'],
   url: '',
   created: '',
};

const listPayload: ApiResponse<Episode> = {
   info: { count: 1, pages: 1, next: null, prev: null },
   results: [sampleEpisode],
};

function renderEpisodes() {
   return render(
      <MemoryRouter>
         <EpisodesPage />
      </MemoryRouter>,
   );
}

describe('EpisodesPage', () => {
   beforeEach(() => {
      mockedGetEpisodes.mockReset();
      mockedGetCharacters.mockReset();
      mockedGetEpisodes.mockResolvedValue(listPayload);
      mockedGetCharacters.mockResolvedValue({
         info: { count: 1, pages: 1, next: null, prev: null },
         results: [
            {
               id: 1,
               name: 'Rick Sanchez',
               status: 'Alive',
               species: 'Human',
               type: '',
               gender: 'Male',
               origin: { name: 'Earth', url: '' },
               location: { name: 'Earth', url: '' },
               image: 'https://example.com/rick.png',
               episode: [],
               url: '',
               created: '',
            },
         ],
      });
   });

   afterEach(() => {
      vi.useRealTimers();
   });

   it('loads episodes on mount with page 1', async () => {
      renderEpisodes();
      await waitFor(() => {
         expect(mockedGetEpisodes).toHaveBeenCalledWith(1, {});
      });
      expect(await screen.findByRole('heading', { name: 'Pilot' })).toBeInTheDocument();
   });

   it('renders search and character filter controls', () => {
      renderEpisodes();
      expect(
         screen.getByPlaceholderText(i18n.t('episodes.filters.searchPlaceholder')),
      ).toBeInTheDocument();
      expect(
         screen.getByLabelText(i18n.t('episodes.filters.charactersLabel')),
      ).toBeInTheDocument();
   });

   it('fetches all pages and filters when a character is selected', async () => {
      mockedGetEpisodes
         .mockResolvedValueOnce({
            info: { count: 2, pages: 2, next: 'x', prev: null },
            results: [
               sampleEpisode,
               {
                  ...sampleEpisode,
                  id: 2,
                  name: 'Other',
                  characters: ['https://rickandmortyapi.com/api/character/99'],
               },
            ],
         })
         .mockResolvedValueOnce({
            info: { count: 2, pages: 2, next: null, prev: 'y' },
            results: [],
         });

      renderEpisodes();

      fireEvent.click(screen.getByLabelText(i18n.t('episodes.filters.charactersLabel')));

      await waitFor(() => {
         expect(mockedGetCharacters).toHaveBeenCalled();
      });

      fireEvent.click(await screen.findByRole('option', { name: /Rick Sanchez/i }));

      await waitFor(() => {
         expect(mockedGetEpisodes).toHaveBeenCalledTimes(2);
      });

      expect(await screen.findByRole('heading', { name: 'Pilot' })).toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: 'Other' })).not.toBeInTheDocument();
   });

   it('debounces name search before calling API with name filter', async () => {
      vi.useFakeTimers();
      renderEpisodes();

      await act(async () => {
         await Promise.resolve();
      });

      expect(mockedGetEpisodes).toHaveBeenCalled();
      mockedGetEpisodes.mockClear();

      const input = screen.getByPlaceholderText(i18n.t('episodes.filters.searchPlaceholder'));
      fireEvent.change(input, { target: { value: 'Pilot' } });

      expect(mockedGetEpisodes).not.toHaveBeenCalled();

      await act(() => {
         vi.advanceTimersByTime(400);
      });
      await act(async () => {
         await Promise.resolve();
      });

      expect(mockedGetEpisodes).toHaveBeenCalledWith(1, { name: 'Pilot' });
   });
});

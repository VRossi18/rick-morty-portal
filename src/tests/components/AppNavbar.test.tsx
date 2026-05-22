import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import i18n from '../../i18n';
import { AppShell } from '../../components/AppShell';
import { TestProviders } from '../testProviders';
import { AboutPage } from '../../pages/AboutPage';
import { EpisodesPage } from '../../pages/EpisodesPage';
import { HomePage } from '../../pages/HomePage';
import { LocationsPage } from '../../pages/LocationsPage';
import { RpgCharacterCreationPage } from '../../pages/RpgCharacterCreationPage';

function renderShell(initialPath: string) {
   return render(
      <TestProviders>
         <MemoryRouter initialEntries={[initialPath]}>
            <Routes>
               <Route path="/" element={<AppShell />}>
                  <Route path="characters" element={<HomePage />} />
                  <Route path="episodes" element={<EpisodesPage />} />
                  <Route path="locations" element={<LocationsPage />} />
                  <Route path="about" element={<AboutPage />} />
                  <Route path="rpg" element={<RpgCharacterCreationPage />} />
               </Route>
            </Routes>
         </MemoryRouter>
      </TestProviders>,
   );
}

describe('AppNavbar', () => {
   it('renders main nav links', () => {
      renderShell('/characters');
      expect(screen.getByRole('link', { name: 'Sobre mim' })).toHaveAttribute('href', '/about');
      expect(screen.getByRole('link', { name: i18n.t('nav.characters') })).toHaveAttribute(
         'href',
         '/characters',
      );
      expect(screen.getByRole('link', { name: 'Episódios' })).toHaveAttribute('href', '/episodes');
      expect(screen.getByRole('link', { name: 'Localizações' })).toHaveAttribute('href', '/locations');
      expect(screen.getByRole('link', { name: 'Rick and Morty RPG' })).toHaveAttribute('href', '/rpg');
      expect(screen.getByRole('button', { name: 'Apoiar' })).toBeInTheDocument();
   });

   it('opens donation modal when support button is clicked', () => {
      renderShell('/characters');

      fireEvent.click(screen.getByRole('button', { name: 'Apoiar' }));

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText(i18n.t('donations.disclaimerTitle'))).toBeInTheDocument();
   });

   it('marks the characters tab active on /characters', () => {
      renderShell('/characters');
      const chars = screen.getByRole('link', { name: i18n.t('nav.characters') });
      expect(chars.className).toMatch(/border-primary/);
   });

   it('marks the about tab active on /about', () => {
      renderShell('/about');
      const about = screen.getByRole('link', { name: 'Sobre mim' });
      expect(about.className).toMatch(/border-primary/);
   });

   it('marks the episodes tab active on /episodes', () => {
      renderShell('/episodes');
      const episodes = screen.getByRole('link', { name: 'Episódios' });
      expect(episodes.className).toMatch(/border-primary/);
   });

   it('marks the rpg tab active on /rpg', () => {
      renderShell('/rpg');
      const rpg = screen.getByRole('link', { name: 'Rick and Morty RPG' });
      expect(rpg.className).toMatch(/border-primary/);
   });

   it('renders language switcher with accessible flag buttons', () => {
      renderShell('/characters');
      expect(
         screen.getByRole('button', { name: /Mudar idioma para português/i }),
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Mudar idioma para inglês/i })).toBeInTheDocument();
   });
});

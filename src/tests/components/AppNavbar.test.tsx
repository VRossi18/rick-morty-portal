import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AppShell } from '../../components/AppShell';
import { AboutPage } from '../../pages/AboutPage';
import { EpisodesPage } from '../../pages/EpisodesPage';
import { HomePage } from '../../pages/HomePage';
import { RpgCharacterCreationPage } from '../../pages/RpgCharacterCreationPage';

function renderShell(initialPath: string) {
   return render(
      <MemoryRouter initialEntries={[initialPath]}>
         <Routes>
            <Route path="/" element={<AppShell />}>
               <Route path="characters" element={<HomePage />} />
               <Route path="episodes" element={<EpisodesPage />} />
               <Route path="about" element={<AboutPage />} />
               <Route path="rpg" element={<RpgCharacterCreationPage />} />
            </Route>
         </Routes>
      </MemoryRouter>,
   );
}

describe('AppNavbar', () => {
   it('renders main nav links', () => {
      renderShell('/characters');
      expect(screen.getByRole('link', { name: 'Sobre mim' })).toHaveAttribute('href', '/about');
      expect(screen.getByRole('link', { name: 'Rick & Morty Personagens' })).toHaveAttribute(
         'href',
         '/characters',
      );
      expect(screen.getByRole('link', { name: 'Episódios' })).toHaveAttribute('href', '/episodes');
      expect(screen.getByRole('link', { name: 'Rick and Morty RPG' })).toHaveAttribute('href', '/rpg');
   });

   it('marks the characters tab active on /characters', () => {
      renderShell('/characters');
      const chars = screen.getByRole('link', { name: 'Rick & Morty Personagens' });
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

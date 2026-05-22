import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import type { Character } from '../../types/api';
import i18n from '../../i18n';
import { CharacterCard } from '../../components/characters/CharacterCard';

const character: Character = {
   id: 1,
   name: 'Rick Sanchez',
   status: 'Alive',
   species: 'Human',
   type: '',
   gender: 'Male',
   origin: { name: 'Earth (C-137)', url: '' },
   location: { name: 'Citadel of Ricks', url: '' },
   image: 'https://example.com/rick.png',
   episode: [],
   url: '',
   created: '',
};

function renderWithRouter(ui: ReactElement) {
   return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('CharacterCard', () => {
   it('renders name, image alt, origin and location', () => {
      renderWithRouter(<CharacterCard character={character} />);
      expect(screen.getByRole('heading', { name: 'Rick Sanchez' })).toBeInTheDocument();
      expect(screen.getByRole('img', { name: 'Rick Sanchez' })).toHaveAttribute(
         'src',
         'https://example.com/rick.png',
      );
      expect(screen.getByText(/Alive — Human/)).toBeInTheDocument();
      expect(screen.getByText(/Earth \(C-137\)/)).toBeInTheDocument();
      expect(screen.getByText(/Citadel of Ricks/)).toBeInTheDocument();
   });

   it('uses pointer cursor on the interactive card', () => {
      renderWithRouter(<CharacterCard character={character} />);
      const link = screen.getByRole('link', {
         name: i18n.t('card.ariaViewDetails', { name: 'Rick Sanchez' }),
      });
      expect(link).toHaveClass('cursor-pointer');
   });

   it('sets pointer CSS variables on mouse move', () => {
      renderWithRouter(<CharacterCard character={character} />);
      const card = screen.getByRole('link', {
         name: i18n.t('card.ariaViewDetails', { name: 'Rick Sanchez' }),
      });
      fireEvent.mouseMove(card, { clientX: 42, clientY: 24 });
      expect(card).toHaveStyle({ '--mx': '42px', '--my': '24px' });
   });
});

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import i18n from '../../i18n';
import { ThemeToggle } from '../../components/layout/ThemeToggle';

describe('ThemeToggle', () => {
   beforeEach(() => {
      localStorage.clear();
      document.documentElement.removeAttribute('data-theme');
      document.documentElement.classList.remove('dark');
   });

   it('toggles data-theme and html.dark when clicked', async () => {
      render(<ThemeToggle />);
      await waitFor(() => {
         expect(document.documentElement.getAttribute('data-theme')).toBe('light');
         expect(document.documentElement.classList.contains('dark')).toBe(false);
      });

      fireEvent.click(screen.getByRole('button', { name: i18n.t('theme.toggle') }));

      await waitFor(() => {
         expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
         expect(document.documentElement.classList.contains('dark')).toBe(true);
      });
   });
});

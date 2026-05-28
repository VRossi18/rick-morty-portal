import { describe, expect, it } from 'vitest';
import { brlToCents, isValidDonationAmountCents } from '../../config/donations';

describe('donations BRL helpers', () => {
   it('converts BRL strings to cents', () => {
      expect(brlToCents('10')).toBe(1000);
      expect(brlToCents('25,50')).toBe(2550);
   });

   it('validates preset and custom cent ranges', () => {
      expect(isValidDonationAmountCents(1000)).toBe(true);
      expect(isValidDonationAmountCents(750)).toBe(true);
      expect(isValidDonationAmountCents(499)).toBe(false);
      expect(isValidDonationAmountCents(50001)).toBe(false);
   });
});

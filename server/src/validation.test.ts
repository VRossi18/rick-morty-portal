import { describe, expect, it } from 'vitest';
import { isAllowedReturnUrl, isValidAmountCents } from './validation.js';

const allowedOrigins = ['https://example.com', 'http://localhost:5173'];

describe('isValidAmountCents', () => {
   it('accepts preset amounts', () => {
      expect(isValidAmountCents(1000)).toBe(true);
      expect(isValidAmountCents(2500)).toBe(true);
      expect(isValidAmountCents(5000)).toBe(true);
   });

   it('accepts custom amounts within range', () => {
      expect(isValidAmountCents(500)).toBe(true);
      expect(isValidAmountCents(1500)).toBe(true);
      expect(isValidAmountCents(50000)).toBe(true);
   });

   it('rejects invalid amounts', () => {
      expect(isValidAmountCents(499)).toBe(false);
      expect(isValidAmountCents(50001)).toBe(false);
      expect(isValidAmountCents(0)).toBe(false);
      expect(isValidAmountCents(10.5)).toBe(false);
   });
});

describe('isAllowedReturnUrl', () => {
   it('allows URLs from allowed origins', () => {
      expect(
         isAllowedReturnUrl('https://example.com/rick-and-morty-portal/?donation=pix-success', allowedOrigins),
      ).toBe(true);
      expect(isAllowedReturnUrl('http://localhost:5173/?donation=pix-cancelled', allowedOrigins)).toBe(
         true,
      );
   });

   it('rejects other origins and invalid URLs', () => {
      expect(isAllowedReturnUrl('https://evil.com/?donation=pix-success', allowedOrigins)).toBe(false);
      expect(isAllowedReturnUrl('javascript:alert(1)', allowedOrigins)).toBe(false);
      expect(isAllowedReturnUrl('not-a-url', allowedOrigins)).toBe(false);
   });
});

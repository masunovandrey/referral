import { describe, expect, it } from 'vitest';
import { getFallbackLogoColor, getFallbackLogoLetter } from '../../src/features/ui/fallbackLogo.js';

describe('fallbackLogo', () => {
  it('returns a deterministic color for a company name', () => {
    expect(getFallbackLogoColor('Acme')).toBe(getFallbackLogoColor('Acme'));
  });

  it('returns the uppercase first letter of the company name', () => {
    expect(getFallbackLogoLetter('acme')).toBe('A');
  });

  it('returns a question mark for an empty company name', () => {
    expect(getFallbackLogoLetter('')).toBe('?');
  });
});

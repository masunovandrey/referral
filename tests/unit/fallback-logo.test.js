import { describe, expect, it } from 'vitest';
import { getFallbackLogoColor, getFallbackLogoIcon, getFallbackLogoLetter } from '../../src/features/ui/fallbackLogo.js';

describe('fallbackLogo', () => {
  it('returns a deterministic color for a company name', () => {
    expect(getFallbackLogoColor('Acme')).toBe(getFallbackLogoColor('Acme'));
  });

  it('returns the uppercase first letter of the company name', () => {
    expect(getFallbackLogoLetter('acme')).toBe('A');
  });

  it('returns a white palm icon svg for the travel category', () => {
    expect(getFallbackLogoIcon({ companyName: 'Palma Tours', categories: ['travel'] })).toContain('fill="#ffffff"');
  });

  it('returns a white hotdog icon svg for the food category', () => {
    expect(getFallbackLogoIcon({ companyName: 'Hotdog', categories: ['food'] })).toContain('fill="#ffffff"');
  });

  it('returns the company initial for other categories', () => {
    expect(getFallbackLogoIcon({ companyName: 'Acme', categories: ['fintech'] })).toBe('A');
  });

  it('returns a question mark for an empty company name', () => {
    expect(getFallbackLogoLetter('')).toBe('?');
  });
});

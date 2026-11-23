import { describe, expect, it } from 'vitest';
import { getFallbackLogoColor, getFallbackLogoIcon, getFallbackLogoLetter } from '../../src/features/ui/fallbackLogo.js';

describe('fallbackLogo', () => {
  it('returns a deterministic color for a company name', () => {
    expect(getFallbackLogoColor('Acme')).toBe(getFallbackLogoColor('Acme'));
  });

  it('returns the uppercase first letter of the company name', () => {
    expect(getFallbackLogoLetter('acme')).toBe('A');
  });

  it('returns the travel image icon', () => {
    expect(getFallbackLogoIcon({ companyName: 'Palma Tours', categories: ['travel'] })).toContain('palm.png');
  });

  it('returns the health image icon', () => {
    expect(getFallbackLogoIcon({ companyName: 'Health Co', categories: ['health'] })).toContain('health.png');
  });

  it('returns the insurance image icon', () => {
    expect(getFallbackLogoIcon({ companyName: 'Insure Co', categories: ['insurance'] })).toContain('insurance.png');
  });

  it('returns the food image icon', () => {
    expect(getFallbackLogoIcon({ companyName: 'Burger Co', categories: ['food'] })).toContain('burger.png');
  });

  it('returns the company initial for other categories', () => {
    expect(getFallbackLogoIcon({ companyName: 'Acme', categories: ['fintech'] })).toBe('A');
  });

  it('returns a question mark for an empty company name', () => {
    expect(getFallbackLogoLetter('')).toBe('?');
  });
});

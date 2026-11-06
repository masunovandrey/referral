import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getLanguage, setLanguage, subscribeToLanguage, translate } from '../../src/features/i18n/i18n.js';

describe('i18n', () => {
  beforeEach(() => {
    setLanguage('en');
  });

  it('returns english strings for known keys', () => {
    expect(translate('home.hero.title')).toBe('Referral links in one click');
    expect(translate('home.catalog.copySuccess')).toBe('Referral link is copied');
    expect(translate('home.hero.cta')).toBe('Browse catalog');
  });

  it('returns the key itself for unknown keys', () => {
    expect(translate('missing.key')).toBe('missing.key');
  });

  it('falls back to english when an unsupported language is set', () => {
    expect(setLanguage('fr')).toBe('en');
    expect(getLanguage()).toBe('en');
    expect(translate('home.hero.title')).toBe('Referral links in one click');
  });

  it('notifies language subscribers', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToLanguage(listener);

    setLanguage('en');

    expect(listener).toHaveBeenCalled();
    unsubscribe();
  });
});

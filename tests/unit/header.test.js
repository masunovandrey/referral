import { describe, expect, it } from 'vitest';
import { renderHeader } from '../../src/features/ui/header.js';
import { setLanguage } from '../../src/features/i18n/i18n.js';

describe('header', () => {
  it('renders the logo link to home', () => {
    const html = renderHeader({});

    expect(html).toContain('href="#/"');
    expect(html).toContain('Referral');
  });

  it('shows login action for anonymous users', () => {
    const html = renderHeader({ isAuthenticated: false });

    expect(html).toContain('data-role="open-login"');
    expect(html).toContain('>Login<');
  });

  it('shows profile action for verified authenticated users', () => {
    const html = renderHeader({ isAuthenticated: true, isEmailVerified: true });

    expect(html).toContain('data-role="open-profile"');
    expect(html).toContain('>Profile<');
  });

  it('renders the language menu with english and russian options', () => {
    setLanguage('en');

    const html = renderHeader({ isAuthenticated: false });

    expect(html).toContain('data-role="language-menu"');
    expect(html).toContain('data-language="en"');
    expect(html).toContain('data-language="ru"');
  });

  it('shows login action when an authenticated user is not verified', () => {
    const html = renderHeader({ isAuthenticated: true, isEmailVerified: false });

    expect(html).toContain('data-role="open-login"');
  });
});

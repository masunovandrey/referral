import { describe, expect, it } from 'vitest';
import { renderHeader } from '../../src/features/ui/header.js';

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

  it('shows login action when an authenticated user is not verified', () => {
    const html = renderHeader({ isAuthenticated: true, isEmailVerified: false });

    expect(html).toContain('data-role="open-login"');
  });
});

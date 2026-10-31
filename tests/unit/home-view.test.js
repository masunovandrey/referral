import { describe, expect, it } from 'vitest';
import { buildEmailAuthViewModel } from '../../src/features/auth/emailAuthViewModel.js';
import { buildHomeViewModel } from '../../src/features/home/homeViewModel.js';
import { renderHomeView } from '../../src/features/home/homeView.js';

describe('renderHomeView', () => {
  it('renders the auth form for anonymous users', () => {
    const html = renderHomeView(buildHomeViewModel(null), buildEmailAuthViewModel('login'));

    expect(html).toContain('id="email-auth-form"');
    expect(html).toContain('id="google-sign-in-button"');
    expect(html).toContain('id="reset-password-button"');
    expect(html).toContain('id="load-recent-public"');
    expect(html).not.toContain('id="logout-button"');
    expect(html).not.toContain('id="open-profile-button"');
  });

  it('hides the auth form and shows identity for authenticated users', () => {
    const html = renderHomeView(
      buildHomeViewModel({ uid: 'user-a', email: 'user@example.com' }),
      buildEmailAuthViewModel('login')
    );

    expect(html).not.toContain('id="email-auth-form"');
    expect(html).not.toContain('id="google-sign-in-button"');
    expect(html).not.toContain('id="reset-password-button"');
    expect(html).toContain('Signed in as user@example.com');
    expect(html).toContain('id="logout-button"');
    expect(html).toContain('id="open-profile-button"');
  });

  it('escapes the identity label', () => {
    const html = renderHomeView(
      buildHomeViewModel({ uid: 'user-a', email: '<script>alert(1)</script>' }),
      buildEmailAuthViewModel('login')
    );

    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(html).not.toContain('<script>alert(1)</script>');
  });
});

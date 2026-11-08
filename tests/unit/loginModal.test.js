import { describe, expect, it } from 'vitest';
import { renderLoginModal } from '../../src/features/ui/loginModal.js';
import { buildEmailAuthViewModel } from '../../src/features/auth/emailAuthViewModel.js';

describe('loginModal', () => {
  it('renders the modal overlay and panel', () => {
    const html = renderLoginModal(buildEmailAuthViewModel('login'));

    expect(html).toContain('data-role="login-modal-overlay"');
    expect(html).toContain('class="modal-panel"');
    expect(html).toContain('role="dialog"');
  });

  it('renders email and password fields with a submit button', () => {
    const html = renderLoginModal(buildEmailAuthViewModel('login'));

    expect(html).toContain('name="email"');
    expect(html).toContain('name="password"');
    expect(html).toContain('type="submit"');
  });

  it('renders a close control', () => {
    const html = renderLoginModal(buildEmailAuthViewModel('login'));

    expect(html).toContain('data-role="login-modal-close"');
  });

  it('renders the auth mode toggle', () => {
    const html = renderLoginModal(buildEmailAuthViewModel('login'));

    expect(html).toContain('id="toggle-email-auth-mode"');
  });

  it('renders the google sign-in button', () => {
    const html = renderLoginModal(buildEmailAuthViewModel('login'));

    expect(html).toContain('id="google-sign-in-button"');
  });

  it('renders the reset password button for login mode', () => {
    const html = renderLoginModal(buildEmailAuthViewModel('login'));

    expect(html).toContain('id="reset-password-button"');
  });

  it('renders the name field for signup mode', () => {
    const html = renderLoginModal(buildEmailAuthViewModel('signup'));

    expect(html).toContain('name="name"');
  });
});

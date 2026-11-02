import { describe, expect, it } from 'vitest';
import { renderLoginModal } from '../../src/features/ui/loginModal.js';

describe('loginModal', () => {
  it('renders the modal overlay and panel', () => {
    const html = renderLoginModal();

    expect(html).toContain('data-role="login-modal-overlay"');
    expect(html).toContain('class="modal-panel"');
    expect(html).toContain('role="dialog"');
  });

  it('renders email and password fields with a submit button', () => {
    const html = renderLoginModal();

    expect(html).toContain('name="email"');
    expect(html).toContain('name="password"');
    expect(html).toContain('type="submit"');
  });

  it('renders a close control', () => {
    const html = renderLoginModal();

    expect(html).toContain('data-role="login-modal-close"');
  });
});

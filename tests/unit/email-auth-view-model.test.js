import { describe, expect, it } from 'vitest';
import { buildEmailAuthViewModel } from '../../src/features/auth/emailAuthViewModel.js';

describe('buildEmailAuthViewModel', () => {
  it('builds the log-in form state', () => {
    expect(buildEmailAuthViewModel('login')).toEqual({
      mode: 'login',
      title: 'Log in with email',
      submitLabel: 'Log in',
      toggleLabel: 'Need an account? Sign up',
      showNameField: false
    });
  });

  it('builds the sign-up form state', () => {
    expect(buildEmailAuthViewModel('signup')).toEqual({
      mode: 'signup',
      title: 'Sign up with email',
      submitLabel: 'Create account',
      toggleLabel: 'Already have an account? Log in',
      showNameField: true
    });
  });
});

import { describe, expect, it, vi } from 'vitest';
import { createUiConfig } from '../../src/firebase/authUiConfig.js';

describe('createUiConfig', () => {
  it('uses popup sign-in and configures the expected providers', () => {
    const config = createUiConfig(vi.fn());

    expect(config.signInFlow).toBe('popup');
    expect(config.signInSuccessUrl).toBe('#/app');
    expect(config.signInOptions).toHaveLength(3);
    expect(config.signInOptions[0]).toBe('password');
    expect(config.signInOptions[1]).toMatchObject({ provider: 'google.com' });
    expect(config.signInOptions[2]).toBe('github.com');
  });

  it('invokes the redirect callback and suppresses firebaseui navigation', () => {
    const onSignedIn = vi.fn();
    const config = createUiConfig(onSignedIn);

    expect(config.callbacks.signInSuccessWithAuthResult()).toBe(false);
    expect(onSignedIn).toHaveBeenCalledTimes(1);
  });
});

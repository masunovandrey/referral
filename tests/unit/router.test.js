import { describe, expect, it } from 'vitest';
import { getHashPath, resolveRoute, routes } from '../../src/router.js';

describe('getHashPath', () => {
  it('returns root for an empty hash', () => {
    expect(getHashPath('')).toBe('/');
  });

  it('normalizes hash routes with leading slash', () => {
    expect(getHashPath('#/login')).toBe('/login');
  });
});

describe('resolveRoute', () => {
  it('keeps anonymous users on the public home route', () => {
    expect(resolveRoute('#/', false)).toBe(routes.home);
  });

  it('redirects anonymous users away from the profile route', () => {
    expect(resolveRoute('#/profile', false)).toBe(routes.home);
  });

  it('allows authenticated users to stay on the public home route', () => {
    expect(resolveRoute('#/', true)).toBe(routes.home);
  });

  it('allows authenticated users to access the profile route', () => {
    expect(resolveRoute('#/profile', true)).toBe(routes.profile);
  });
});

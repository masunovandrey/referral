import { describe, expect, it } from 'vitest';
import { buildHomeViewModel } from '../../src/features/home/homeViewModel.js';

describe('buildHomeViewModel', () => {
  it('returns guest actions for anonymous users', () => {
    expect(buildHomeViewModel(null)).toEqual({
      isAuthenticated: false,
      showAuthSection: true,
      identityLabel: '',
      showLogout: false,
      showProfileButton: false,
      publicDataButtons: [
        { id: 'load-recent-public', label: 'Load recent public data' },
        { id: 'load-featured-public', label: 'Load featured public data' }
      ]
    });
  });

  it('returns signed-in actions for authenticated users', () => {
    expect(buildHomeViewModel({ uid: 'user-a', email: 'user@example.com' })).toEqual({
      isAuthenticated: true,
      showAuthSection: false,
      identityLabel: 'user@example.com',
      showLogout: true,
      showProfileButton: true,
      publicDataButtons: [
        { id: 'load-recent-public', label: 'Load recent public data' },
        { id: 'load-featured-public', label: 'Load featured public data' }
      ]
    });
  });

  it('falls back to display name and then a generic identity', () => {
    expect(buildHomeViewModel({ uid: 'user-a', displayName: 'Alice' }).identityLabel).toBe('Alice');
    expect(buildHomeViewModel({ uid: 'user-a' }).identityLabel).toBe('authenticated user');
  });
});

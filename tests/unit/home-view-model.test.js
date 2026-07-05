import { describe, expect, it } from 'vitest';
import { buildHomeViewModel } from '../../src/features/home/homeViewModel.js';

describe('buildHomeViewModel', () => {
  it('returns guest actions for anonymous users', () => {
    expect(buildHomeViewModel(null)).toEqual({
      isAuthenticated: false,
      primaryActionLabel: 'Sign in or register',
      showLogout: false,
      showProfileButton: false,
      publicDataButtons: [
        { id: 'load-recent-public', label: 'Load recent public data' },
        { id: 'load-featured-public', label: 'Load featured public data' }
      ]
    });
  });

  it('returns signed-in actions for authenticated users', () => {
    expect(buildHomeViewModel({ uid: 'user-a' })).toEqual({
      isAuthenticated: true,
      primaryActionLabel: 'View your profile',
      showLogout: true,
      showProfileButton: true,
      publicDataButtons: [
        { id: 'load-recent-public', label: 'Load recent public data' },
        { id: 'load-featured-public', label: 'Load featured public data' }
      ]
    });
  });
});

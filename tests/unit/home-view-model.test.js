import { describe, expect, it } from 'vitest';
import { buildHomeViewModel } from '../../src/features/home/homeViewModel.js';

describe('buildHomeViewModel', () => {
  it('returns guest actions for anonymous users', () => {
    expect(buildHomeViewModel(null)).toEqual({
      isAuthenticated: false,
      isEmailVerified: false,
      showAuthSection: true,
      showVerificationBanner: false,
      identityLabel: '',
      showLogout: false,
      showProfileButton: false,
      publicDataButtons: [
        { id: 'load-recent-public', label: 'Load recent public data' },
        { id: 'load-featured-public', label: 'Load featured public data' }
      ]
    });
  });

  it('returns verified signed-in actions for verified users', () => {
    expect(
      buildHomeViewModel({ uid: 'user-a', email: 'user@example.com', emailVerified: true })
    ).toEqual({
      isAuthenticated: true,
      isEmailVerified: true,
      showAuthSection: false,
      showVerificationBanner: false,
      identityLabel: 'user@example.com',
      showLogout: true,
      showProfileButton: true,
      publicDataButtons: [
        { id: 'load-recent-public', label: 'Load recent public data' },
        { id: 'load-featured-public', label: 'Load featured public data' }
      ]
    });
  });

  it('shows the verification banner and hides the profile button for unverified users', () => {
    const viewModel = buildHomeViewModel({
      uid: 'user-a',
      email: 'user@example.com',
      emailVerified: false
    });

    expect(viewModel.isEmailVerified).toBe(false);
    expect(viewModel.showVerificationBanner).toBe(true);
    expect(viewModel.showAuthSection).toBe(false);
    expect(viewModel.showProfileButton).toBe(false);
    expect(viewModel.identityLabel).toBe('user@example.com');
  });

  it('falls back to display name and then a generic identity', () => {
    expect(buildHomeViewModel({ uid: 'user-a', displayName: 'Alice' }).identityLabel).toBe('Alice');
    expect(buildHomeViewModel({ uid: 'user-a' }).identityLabel).toBe('authenticated user');
  });
});

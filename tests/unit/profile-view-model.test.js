import { describe, expect, it } from 'vitest';
import { buildProfileViewModel } from '../../src/features/privateRows/profileViewModel.js';

describe('buildProfileViewModel', () => {
  it('builds a signed-in profile state from the current user', () => {
    expect(
      buildProfileViewModel({
        uid: 'user-a',
        email: 'user@example.com',
        displayName: 'Example User'
      })
    ).toEqual({
      userId: 'user-a',
      identityLabel: 'user@example.com',
      emptyStateTitle: 'No referral entries yet',
      emptyStateDescription: 'Create your first referral entry to build your personal referral collection.',
      submitButtonLabel: 'Add referral entry'
    });
  });

  it('falls back to display name when email is missing', () => {
    expect(
      buildProfileViewModel({
        uid: 'user-a',
        displayName: 'Example User'
      })
    ).toEqual({
      userId: 'user-a',
      identityLabel: 'Example User',
      emptyStateTitle: 'No referral entries yet',
      emptyStateDescription: 'Create your first referral entry to build your personal referral collection.',
      submitButtonLabel: 'Add referral entry'
    });
  });
});

export function buildProfileViewModel(user) {
  return {
    userId: user?.uid ?? '',
    identityLabel: user?.email || user?.displayName || 'authenticated user',
    emptyStateTitle: 'No referral entries yet',
    emptyStateDescription: 'Create your first referral entry to build your personal referral collection.',
    submitButtonLabel: 'Add referral entry'
  };
}

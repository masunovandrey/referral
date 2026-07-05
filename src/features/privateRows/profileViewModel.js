export function buildProfileViewModel(user) {
  return {
    userId: user?.uid ?? '',
    identityLabel: user?.email || user?.displayName || 'authenticated user',
    emptyStateTitle: 'No personal rows yet',
    emptyStateDescription: 'Create your first private row to start building your personal dataset.',
    submitButtonLabel: 'Add row'
  };
}

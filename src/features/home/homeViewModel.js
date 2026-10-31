export function buildHomeViewModel(user) {
  const isAuthenticated = Boolean(user);
  const isEmailVerified = isAuthenticated && Boolean(user.emailVerified);

  return {
    isAuthenticated,
    isEmailVerified,
    showAuthSection: !isAuthenticated,
    showVerificationBanner: isAuthenticated && !isEmailVerified,
    identityLabel: isAuthenticated
      ? user.email || user.displayName || 'authenticated user'
      : '',
    showLogout: isAuthenticated,
    showProfileButton: isEmailVerified,
    publicDataButtons: [
      { id: 'load-recent-public', label: 'Load recent public data' },
      { id: 'load-featured-public', label: 'Load featured public data' }
    ]
  };
}

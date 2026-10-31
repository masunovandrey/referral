export function buildHomeViewModel(user) {
  const isAuthenticated = Boolean(user);

  return {
    isAuthenticated,
    showAuthSection: !isAuthenticated,
    identityLabel: isAuthenticated
      ? user.email || user.displayName || 'authenticated user'
      : '',
    showLogout: isAuthenticated,
    showProfileButton: isAuthenticated,
    publicDataButtons: [
      { id: 'load-recent-public', label: 'Load recent public data' },
      { id: 'load-featured-public', label: 'Load featured public data' }
    ]
  };
}

export function buildHomeViewModel(user) {
  const isAuthenticated = Boolean(user);

  return {
    isAuthenticated,
    primaryActionLabel: isAuthenticated ? 'View your profile' : 'Sign in or register',
    showLogout: isAuthenticated,
    showProfileButton: isAuthenticated,
    publicDataButtons: [
      { id: 'load-recent-public', label: 'Load recent public data' },
      { id: 'load-featured-public', label: 'Load featured public data' }
    ]
  };
}

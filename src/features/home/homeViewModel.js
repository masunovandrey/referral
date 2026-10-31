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
    showProfileButton: isEmailVerified
  };
}

export const routes = {
  home: '/',
  profile: '/profile'
};

export function getHashPath(hash) {
  if (!hash || hash === '#') {
    return '/';
  }

  const normalized = hash.startsWith('#') ? hash.slice(1) : hash;
  return normalized.startsWith('/') ? normalized : `/${normalized}`;
}

export function resolveRoute(hash, isAuthenticated, isEmailVerified = false) {
  const path = getHashPath(hash);

  if (path === routes.home) {
    return routes.home;
  }

  if (path === routes.profile) {
    return isAuthenticated && isEmailVerified ? routes.profile : routes.home;
  }

  return routes.home;
}

export function navigateTo(route) {
  window.location.hash = route;
}

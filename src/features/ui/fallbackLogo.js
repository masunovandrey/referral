const FALLBACK_LOGO_COLORS = ['#4f7cff', '#8b5cf6', '#06b6d4', '#f59e0b', '#ef4444', '#10b981'];

export function getFallbackLogoColor(companyName) {
  const normalized = String(companyName ?? '');
  let hash = 0;

  for (let index = 0; index < normalized.length; index += 1) {
    hash = (hash * 31 + normalized.charCodeAt(index)) % 360;
  }

  return FALLBACK_LOGO_COLORS[hash % FALLBACK_LOGO_COLORS.length];
}

export function getFallbackLogoIcon({ companyName, categories = [] } = {}) {
  const hasCategory = (categoryName) => (categories ?? []).some(
    (category) => String(category ?? '').trim().toLowerCase() === categoryName
  );

  if (hasCategory('travel')) {
    return '<svg class="fallback-logo__icon" viewBox="0 0 24 24" width="18" height="18" fill="#ffffff" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M12 21v-9" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" fill="none"/><path d="M12 16c-3-2.5-6.5-4.5-9-6.5 2.5 3 6 5.5 9 7.5" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" fill="none"/><path d="M12 16c3-2.5 6.5-4.5 9-6.5-2.5 3-6 5.5-9 7.5" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" fill="none"/></svg>';
  }

  if (hasCategory('food')) {
    return '<svg class="fallback-logo__icon" viewBox="0 0 24 24" width="18" height="18" fill="#ffffff" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect x="5" y="8.5" width="14" height="7" rx="3.5"/></svg>';
  }

  return getFallbackLogoLetter(companyName);
}

export function getFallbackLogoLetter(companyName) {
  const normalized = String(companyName ?? '').trim();

  if (!normalized) {
    return '?';
  }

  return normalized.charAt(0).toUpperCase();
}

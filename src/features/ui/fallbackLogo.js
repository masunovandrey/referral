const FALLBACK_LOGO_COLORS = ['#4f7cff', '#8b5cf6', '#06b6d4', '#f59e0b', '#ef4444', '#10b981'];

export function getFallbackLogoColor(companyName) {
  const normalized = String(companyName ?? '');
  let hash = 0;

  for (let index = 0; index < normalized.length; index += 1) {
    hash = (hash * 31 + normalized.charCodeAt(index)) % 360;
  }

  return FALLBACK_LOGO_COLORS[hash % FALLBACK_LOGO_COLORS.length];
}

export function getFallbackLogoLetter(companyName) {
  const normalized = String(companyName ?? '').trim();

  if (!normalized) {
    return '?';
  }

  return normalized.charAt(0).toUpperCase();
}

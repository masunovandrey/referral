const FALLBACK_LOGO_COLORS = ['#4f7cff', '#8b5cf6', '#06b6d4', '#f59e0b', '#ef4444', '#10b981'];

export function getFallbackLogoColor(companyName) {
  const normalized = String(companyName ?? '');
  let hash = 0;

  for (let index = 0; index < normalized.length; index += 1) {
    hash = (hash * 31 + normalized.charCodeAt(index)) % 360;
  }

  return FALLBACK_LOGO_COLORS[hash % FALLBACK_LOGO_COLORS.length];
}

const FALLBACK_LOGO_IMAGES = [
  { category: 'travel', fileName: 'palm.png' },
  { category: 'health', fileName: 'health.png' },
  { category: 'insurance', fileName: 'insurance.png' },
  { category: 'food', fileName: 'burger.png' }
];

export function getFallbackLogoIcon({ companyName, categories = [] } = {}) {
  const normalizedCategories = (categories ?? []).map(
    (category) => String(category ?? '').trim().toLowerCase()
  );

  const fallbackLogoImage = FALLBACK_LOGO_IMAGES.find(
    (image) => normalizedCategories.includes(image.category)
  );

  if (fallbackLogoImage) {
    return `<img class="fallback-logo__icon" src="${fallbackLogoImage.fileName}" alt="" />`;
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

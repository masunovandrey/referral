import { getFallbackLogoColor, getFallbackLogoLetter } from '../ui/fallbackLogo.js';

export function renderPublicRows(groups) {
  if (groups.length === 0) {
    return `
      <div class="placeholder">
        <h2>Referral catalog</h2>
        <p>No referral links are published yet.</p>
      </div>
    `;
  }

  return `
    <section class="public-rows">
      <h2>Referral catalog</h2>
      <p class="catalog-hint">Click a company to copy a random referral link.</p>
      <div class="public-row-list">
        ${groups
          .map(
            (group) => `
              <article class="public-row-card">
                <h3>
                  <span class="fallback-logo" style="background-color: ${getFallbackLogoColor(group.companyName)}">${getFallbackLogoLetter(group.companyName)}</span>
                  <button class="company-copy-button" type="button" data-company-key="${escapeHtmlAttribute(group.companyKey)}">
                    ${escapeHtml(group.companyName)}
                  </button>
                </h3>
                <p>${escapeHtml(formatCategories(group.categories))} &middot; ${formatLinkCount(group.linkCount)}</p>
              </article>
            `
          )
          .join('')}
      </div>
      <p id="public-catalog-feedback" class="form-feedback" aria-live="polite"></p>
    </section>
  `;
}

function formatCategories(categories) {
  return categories.length > 0 ? categories.join(', ') : 'Uncategorized';
}

function formatLinkCount(linkCount) {
  return `${linkCount} referral ${linkCount === 1 ? 'link' : 'links'}`;
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function escapeHtmlAttribute(value) {
  return escapeHtml(value);
}

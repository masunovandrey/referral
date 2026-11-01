import { getLanguage } from '../i18n/i18n.js';

const LANGUAGE_LABELS = { en: 'EN', ru: 'RU', de: 'DE' };

export function renderHeader({ isAuthenticated = false, isEmailVerified = false } = {}) {
  const isProfileAvailable = Boolean(isAuthenticated) && isEmailVerified;
  const actionLabel = isProfileAvailable ? 'Profile' : 'Login';
  const actionRole = isProfileAvailable ? 'open-profile' : 'open-login';
  const languageLabel = LANGUAGE_LABELS[getLanguage()] ?? 'EN';

  return `
    <header class="app-header">
      <div class="app-header__left"></div>
      <div class="app-header__center">
        <a class="app-header__logo" href="#/">Referral</a>
      </div>
      <div class="app-header__right">
        <button class="app-header__action" type="button" data-role="language-toggle">${languageLabel}</button>
        <button class="app-header__action" type="button" data-role="${actionRole}">${actionLabel}</button>
      </div>
    </header>
  `;
}

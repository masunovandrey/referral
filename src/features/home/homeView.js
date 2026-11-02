import { renderHeader } from '../ui/header.js';
import { renderHero, renderSearchInput, renderCategoryChips, renderCompanyCards } from './homeCatalog.js';

export function renderHomeView(viewModel, emailAuthViewModel, catalog = { groups: [], categories: [], selectedCategory: '', query: '' }) {
  const lede = viewModel.isAuthenticated
    ? `Signed in as ${escapeHtml(viewModel.identityLabel)}.`
    : 'Anyone can view this page. Sign in to access your personal profile.';

  const header = renderHeader({
    isAuthenticated: viewModel.isAuthenticated,
    isEmailVerified: viewModel.isEmailVerified
  });

  const hero = renderHero();
  const searchInput = renderSearchInput({ value: catalog.query });
  const chips = renderCategoryChips({ categories: catalog.categories, selectedCategory: catalog.selectedCategory });
  const catalogContent = renderCompanyCards({ groups: catalog.groups });

  return `
    <main class="layout">
      ${header}
      <section class="panel auth-panel">
        <div class="panel-header">
          <div>
            <p class="eyebrow">Referral</p>
            <h1>Public Home</h1>
          </div>
          ${viewModel.showLogout ? '<button id="logout-button" class="action-button" type="button">Log out</button>' : ''}
        </div>
        <p class="lede">${lede}</p>
        ${viewModel.showVerificationBanner ? renderVerificationBanner(viewModel.identityLabel) : ''}
        ${viewModel.showProfileButton ? `
          <div class="action-row">
            <button id="open-profile-button" class="action-button" type="button">View your profile</button>
          </div>
        ` : ''}
        ${hero}
        ${searchInput}
        ${chips}
        <div id="public-catalog-container" class="placeholder">
          ${catalogContent}
        </div>
        ${viewModel.showAuthSection ? renderAuthSection(emailAuthViewModel) : ''}
      </section>
    </main>
  `;
}

function renderVerificationBanner(emailLabel) {
  return `
        <section class="verification-banner">
          <h2>Confirm your email</h2>
          <p>We sent a verification link to ${escapeHtml(emailLabel)}. Confirm it to access your profile.</p>
          <div class="action-row">
            <button id="resend-verification-button" class="action-button" type="button">Resend email</button>
            <button id="refresh-verification-button" class="action-button secondary-button" type="button">I confirmed my email</button>
          </div>
          <p id="verification-feedback" class="form-feedback" aria-live="polite"></p>
        </section>
  `;
}

function renderAuthSection(emailAuthViewModel) {
  return `
        <section class="auth-section">
          <div class="auth-section-header">
            <h2>${escapeHtml(emailAuthViewModel.title)}</h2>
            <button id="toggle-email-auth-mode" class="text-button" type="button">${escapeHtml(emailAuthViewModel.toggleLabel)}</button>
          </div>
          <form id="email-auth-form" class="profile-form">
            ${emailAuthViewModel.showNameField ? `
              <label class="field">
                <span>Name</span>
                <input name="name" type="text" autocomplete="name" />
              </label>
            ` : ''}
            <label class="field">
              <span>Email</span>
              <input name="email" type="email" autocomplete="email" />
            </label>
            <label class="field">
              <span>Password</span>
              <input name="password" type="password" autocomplete="${emailAuthViewModel.mode === 'signup' ? 'new-password' : 'current-password'}" />
            </label>
            <button class="action-button" type="submit">${escapeHtml(emailAuthViewModel.submitLabel)}</button>
          </form>
          ${emailAuthViewModel.mode === 'login' ? '<button id="reset-password-button" class="text-button" type="button">Reset password</button>' : ''}
          <p id="email-auth-feedback" class="form-feedback" aria-live="polite"></p>
          <div class="auth-divider"><span>or</span></div>
          <button id="google-sign-in-button" class="action-button secondary-button" type="button">Continue with Google</button>
        </section>
  `;
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

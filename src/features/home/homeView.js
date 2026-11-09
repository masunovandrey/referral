import { renderHeader } from '../ui/header.js';
import { renderLoginModal } from '../ui/loginModal.js';
import { renderHero, renderSearchInput, renderCategoryChips, renderCompanyCards } from './homeCatalog.js';

export function renderHomeView(viewModel, emailAuthViewModel, catalog = { groups: [], categories: [], selectedCategory: '', query: '' }, loginOpen = false) {
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
          <div></div>
          ${viewModel.showLogout ? '<button id="logout-button" class="action-button" type="button">Log out</button>' : ''}
        </div>
        ${viewModel.isAuthenticated ? `<p class="lede">Signed in as ${escapeHtml(viewModel.identityLabel)}.</p>` : ''}
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
        ${viewModel.showAuthSection && loginOpen ? renderLoginModal(emailAuthViewModel) : ''}
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

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

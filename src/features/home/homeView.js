export function renderHomeView(viewModel, emailAuthViewModel) {
  const publicDataButtons = viewModel.publicDataButtons
    .map(
      (button) =>
        `<button id="${button.id}" class="action-button secondary-button" type="button">${escapeHtml(button.label)}</button>`
    )
    .join('');

  const lede = viewModel.isAuthenticated
    ? `Signed in as ${escapeHtml(viewModel.identityLabel)}.`
    : 'Anyone can view this page. Sign in to access your personal profile.';

  return `
    <main class="layout">
      <section class="panel auth-panel">
        <div class="panel-header">
          <div>
            <p class="eyebrow">Referral</p>
            <h1>Public Home</h1>
          </div>
          ${viewModel.showLogout ? '<button id="logout-button" class="action-button" type="button">Log out</button>' : ''}
        </div>
        <p class="lede">${lede}</p>
        <div class="action-row">
          ${publicDataButtons}
          ${viewModel.showProfileButton ? '<button id="open-profile-button" class="action-button" type="button">View your profile</button>' : ''}
        </div>
        <div id="public-data-container" class="placeholder">
          <h2>Public data placeholder</h2>
          <p>Public Firestore rows will be shown here in the next step.</p>
        </div>
        ${viewModel.showAuthSection ? renderAuthSection(emailAuthViewModel) : ''}
      </section>
    </main>
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

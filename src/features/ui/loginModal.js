export function renderLoginModal(emailAuthViewModel) {
  const nameField = emailAuthViewModel.showNameField
    ? `
      <label class="field">
        <span>Name</span>
        <input name="name" type="text" autocomplete="name" />
      </label>
    `
    : '';

  return `
    <div class="modal-overlay" data-role="login-modal-overlay">
      <div class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="login-modal-title">
        <div class="auth-section-header">
          <h2 id="login-modal-title">${escapeHtml(emailAuthViewModel.title)}</h2>
          <div class="modal-header__actions">
            <button class="modal-close" type="button" data-role="login-modal-close">×</button>
            <button id="toggle-email-auth-mode" class="text-button" type="button">${escapeHtml(emailAuthViewModel.toggleLabel)}</button>
          </div>
        </div>
        <form id="email-auth-form" class="profile-form" data-role="login-modal-form">
          ${nameField}
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
      </div>
    </div>
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

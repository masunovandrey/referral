export function renderLoginModal() {
  return `
    <div class="modal-overlay" data-role="login-modal-overlay">
      <div class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="login-modal-title">
        <button class="modal-close" type="button" data-role="login-modal-close">×</button>
        <h2 id="login-modal-title">Log in with email</h2>
        <form id="login-modal-form" class="profile-form" data-role="login-modal-form">
          <label class="field">
            <span>Email</span>
            <input name="email" type="email" autocomplete="email" />
          </label>
          <label class="field">
            <span>Password</span>
            <input name="password" type="password" autocomplete="current-password" />
          </label>
          <button class="action-button" type="submit">Log in</button>
        </form>
      </div>
    </div>
  `;
}

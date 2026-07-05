import { onAuthStateChanged } from 'firebase/auth';
import {
  auth,
  logInWithEmail,
  resetPassword,
  signInWithGoogle,
  signOutUser,
  signUpWithEmail
} from './firebase/auth.js';
import { buildEmailAuthViewModel } from './features/auth/emailAuthViewModel.js';
import { buildHomeViewModel } from './features/home/homeViewModel.js';
import {
  createUserRow,
  deleteUserRow,
  listUserRows,
  updateUserRow
} from './features/privateRows/privateRows.api.js';
import { buildProfileViewModel } from './features/privateRows/profileViewModel.js';
import { renderPrivateRows } from './features/privateRows/privateRows.ui.js';
import { listPublicRows } from './features/publicRows/publicRows.api.js';
import { renderPublicRows } from './features/publicRows/publicRows.ui.js';
import { getHashPath, navigateTo, resolveRoute, routes } from './router.js';

export function initApp(root) {
  let currentUser = auth.currentUser;
  let emailAuthMode = 'login';

  const render = () => {
    const nextRoute = resolveRoute(window.location.hash, Boolean(currentUser));
    const currentPath = getHashPath(window.location.hash);

    if (nextRoute !== currentPath) {
      navigateTo(nextRoute);
      return;
    }

    if (nextRoute === routes.home) {
      renderHomePage(root, currentUser, emailAuthMode, (nextMode) => {
        emailAuthMode = nextMode;
        render();
      });
      return;
    }

    renderProfilePage(root, currentUser);
  };

  onAuthStateChanged(auth, (user) => {
    currentUser = user;
    render();
  });

  window.addEventListener('hashchange', render);
  render();
}

function renderHomePage(root, user, emailAuthMode, setEmailAuthMode) {
  const viewModel = buildHomeViewModel(user);
  const emailAuthViewModel = buildEmailAuthViewModel(emailAuthMode);
  const publicDataButtons = viewModel.publicDataButtons
    .map(
      (button) =>
        `<button id="${button.id}" class="action-button secondary-button" type="button">${button.label}</button>`
    )
    .join('');

  root.innerHTML = `
    <main class="layout">
      <section class="panel auth-panel">
        <div class="panel-header">
          <div>
            <p class="eyebrow">Referral</p>
            <h1>Public Home</h1>
          </div>
          ${viewModel.showLogout ? '<button id="logout-button" class="action-button" type="button">Log out</button>' : ''}
        </div>
        <p class="lede">Anyone can view this page. Sign in to access your personal profile.</p>
        <div class="action-row">
          ${publicDataButtons}
          ${viewModel.showProfileButton ? '<button id="open-profile-button" class="action-button" type="button">View your profile</button>' : ''}
        </div>
        <div id="public-data-container" class="placeholder">
          <h2>Public data placeholder</h2>
          <p>Public Firestore rows will be shown here in the next step.</p>
        </div>
        <section class="auth-section">
          <div class="auth-section-header">
            <h2>${emailAuthViewModel.title}</h2>
            <button id="toggle-email-auth-mode" class="text-button" type="button">${emailAuthViewModel.toggleLabel}</button>
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
            <button class="action-button" type="submit">${emailAuthViewModel.submitLabel}</button>
          </form>
          ${emailAuthViewModel.mode === 'login' ? '<button id="reset-password-button" class="text-button" type="button">Reset password</button>' : ''}
          <p id="email-auth-feedback" class="form-feedback" aria-live="polite"></p>
          <div class="auth-divider"><span>or</span></div>
          <button id="google-sign-in-button" class="action-button secondary-button" type="button">Continue with Google</button>
        </section>
      </section>
    </main>
  `;

  if (viewModel.isAuthenticated) {
    root.querySelector('#logout-button')?.addEventListener('click', async () => {
      await signOutUser();
      navigateTo(routes.home);
    });

    root.querySelector('#open-profile-button')?.addEventListener('click', () => {
      navigateTo(routes.profile);
    });

    wirePublicDataButtons(root);
    return;
  }

  root.querySelector('#toggle-email-auth-mode')?.addEventListener('click', () => {
    setEmailAuthMode(emailAuthViewModel.mode === 'login' ? 'signup' : 'login');
  });

  root.querySelector('#email-auth-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    void handleEmailAuth(root, emailAuthViewModel.mode, event.currentTarget);
  });

  root.querySelector('#reset-password-button')?.addEventListener('click', () => {
    const form = root.querySelector('#email-auth-form');
    if (!(form instanceof HTMLFormElement)) {
      return;
    }

    void handlePasswordReset(root, form);
  });

  root.querySelector('#google-sign-in-button')?.addEventListener('click', async () => {
    const feedback = root.querySelector('#email-auth-feedback');
    if (feedback) {
      feedback.textContent = 'Signing in with Google...';
    }

    try {
      await signInWithGoogle();
      navigateTo(routes.profile);
    } catch (error) {
      if (feedback) {
        feedback.textContent = getAuthErrorMessage(error);
      }
    }
  });

  wirePublicDataButtons(root);
}

function renderProfilePage(root, user) {
  const viewModel = buildProfileViewModel(user);

  root.innerHTML = `
    <main class="layout">
      <section class="panel private-panel">
        <div class="panel-header">
          <div>
            <p class="eyebrow">Private</p>
            <h1>Profile</h1>
          </div>
          <button id="logout-button" class="action-button" type="button">Log out</button>
        </div>
        <p class="lede">Signed in as ${escapeHtml(viewModel.identityLabel)}.</p>
        <div class="action-row">
          <button id="back-home-button" class="action-button secondary-button" type="button">Back to home</button>
        </div>
        <section class="profile-section">
          <h2>Your personal rows</h2>
          <div id="private-rows-container" class="placeholder">
            <h3>${escapeHtml(viewModel.emptyStateTitle)}</h3>
            <p>${escapeHtml(viewModel.emptyStateDescription)}</p>
          </div>
        </section>
        <section class="profile-section">
          <h2>Add a referral entry</h2>
          <form id="private-row-form" class="profile-form">
            <label class="field">
              <span>Company name</span>
              <input name="companyName" type="text" autocomplete="organization" />
            </label>
            <label class="field">
              <span>Referral link</span>
              <input name="referralLink" type="url" autocomplete="url" />
            </label>
            <label class="field">
              <span>Bonus description</span>
              <textarea name="bonusDescription" rows="4"></textarea>
            </label>
            <button class="action-button" type="submit">${escapeHtml(viewModel.submitButtonLabel)}</button>
          </form>
          <p id="private-row-feedback" class="form-feedback" aria-live="polite"></p>
        </section>
      </section>
    </main>
  `;

  root.querySelector('#logout-button')?.addEventListener('click', async () => {
    await signOutUser();
    navigateTo(routes.home);
  });

  root.querySelector('#back-home-button')?.addEventListener('click', () => {
    navigateTo(routes.home);
  });

  root.querySelector('#private-row-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    void handleCreateUserRow(root, viewModel.userId, event.currentTarget);
  });

  void loadPrivateRows(root, viewModel);
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function wirePublicDataButtons(root) {
  root.querySelector('#load-recent-public')?.addEventListener('click', () => {
    void loadPublicRows(root);
  });

  root.querySelector('#load-featured-public')?.addEventListener('click', () => {
    void loadPublicRows(root);
  });
}

async function loadPublicRows(root) {
  const container = root.querySelector('#public-data-container');
  if (!container) {
    return;
  }

  container.innerHTML = `
    <div class="placeholder">
      <h2>Public data</h2>
      <p>Loading public rows...</p>
    </div>
  `;

  try {
    const rows = await listPublicRows();
    container.outerHTML = `<div id="public-data-container">${renderPublicRows(rows)}</div>`;
  } catch (error) {
    container.innerHTML = `
      <div class="placeholder">
        <h2>Public data</h2>
        <p>Failed to load public rows. Check Firebase configuration and Firestore data.</p>
      </div>
    `;
  }
}

async function handlePasswordReset(root, form) {
  const feedback = root.querySelector('#email-auth-feedback');
  if (!feedback) {
    return;
  }

  const formData = new FormData(form);
  const email = String(formData.get('email') ?? '').trim();

  if (!email) {
    feedback.textContent = 'Enter your email first, then click reset password.';
    return;
  }

  feedback.textContent = 'Sending password reset email...';

  try {
    await resetPassword(email);
    feedback.textContent = 'Password reset email sent. Check your inbox.';
  } catch (error) {
    feedback.textContent = getAuthErrorMessage(error);
  }
}

async function handleCreateUserRow(root, userId, form) {
  const feedback = root.querySelector('#private-row-feedback');
  if (!feedback) {
    return;
  }

  const formData = new FormData(form);
  const input = {
    companyName: formData.get('companyName'),
    referralLink: formData.get('referralLink'),
    bonusDescription: formData.get('bonusDescription')
  };

  feedback.textContent = 'Saving referral entry...';

  try {
    await createUserRow(userId, input);
    form.reset();
    feedback.textContent = 'Referral entry created.';
    await loadPrivateRows(root, {
      emptyStateTitle: 'No personal rows yet',
      emptyStateDescription: 'Create your first private row to start building your personal dataset.',
      userId
    });
  } catch (error) {
    feedback.textContent = 'Failed to create referral entry. Check authentication and Firestore access.';
  }
}

async function handleEmailAuth(root, mode, form) {
  const feedback = root.querySelector('#email-auth-feedback');
  if (!feedback) {
    return;
  }

  const formData = new FormData(form);
  const input = {
    name: String(formData.get('name') ?? '').trim(),
    email: String(formData.get('email') ?? '').trim(),
    password: String(formData.get('password') ?? '')
  };

  feedback.textContent = mode === 'signup' ? 'Creating account...' : 'Logging in...';

  try {
    if (mode === 'signup') {
      await signUpWithEmail(input);
    } else {
      await logInWithEmail(input);
    }

    form.reset();
    navigateTo(routes.profile);
  } catch (error) {
    feedback.textContent = getAuthErrorMessage(error);
  }
}

async function loadPrivateRows(root, viewModel) {
  const container = root.querySelector('#private-rows-container');
  if (!container) {
    return;
  }

  container.innerHTML = `
      <div class="placeholder">
        <h3>Loading referral entries...</h3>
        <p>Fetching your private data from Firestore.</p>
      </div>
  `;

  try {
    const rows = await listUserRows(viewModel.userId);
    container.innerHTML = renderPrivateRows(rows, {
      title: viewModel.emptyStateTitle,
      description: viewModel.emptyStateDescription
    });
    wirePrivateRowEditForms(root, viewModel.userId);
  } catch (error) {
    container.innerHTML = `
      <div class="placeholder">
        <h3>Failed to load referral entries</h3>
        <p>Check authentication and Firestore access, then try again.</p>
      </div>
    `;
  }
}

function wirePrivateRowEditForms(root, userId) {
  const forms = root.querySelectorAll('.private-row-edit-form');

  for (const form of forms) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const rowId = form.getAttribute('data-row-id');
      if (!rowId) {
        return;
      }

      void handleUpdateUserRow(root, userId, rowId, form);
    });

    form.querySelector('[data-role="delete-row"]')?.addEventListener('click', () => {
      const rowId = form.getAttribute('data-row-id');
      if (!rowId) {
        return;
      }

      void handleDeleteUserRow(root, userId, rowId, form);
    });
  }
}

async function handleUpdateUserRow(root, userId, rowId, form) {
  const feedback = form.querySelector('[data-role="edit-feedback"]');
  if (!feedback) {
    return;
  }

  const formData = new FormData(form);
  const input = {
    companyName: formData.get('companyName'),
    referralLink: formData.get('referralLink'),
    bonusDescription: formData.get('bonusDescription')
  };

  feedback.textContent = 'Saving changes...';

  try {
    await updateUserRow(userId, rowId, input);
    feedback.textContent = 'Referral entry updated.';
    await loadPrivateRows(root, {
      emptyStateTitle: 'No personal rows yet',
      emptyStateDescription: 'Create your first private row to start building your personal dataset.',
      userId
    });
  } catch (error) {
    feedback.textContent = 'Failed to update referral entry. Check authentication and Firestore access.';
  }
}

async function handleDeleteUserRow(root, userId, rowId, form) {
  const feedback = form.querySelector('[data-role="edit-feedback"]');
  if (!feedback) {
    return;
  }

  feedback.textContent = 'Deleting personal row...';

  try {
    await deleteUserRow(userId, rowId);
    await loadPrivateRows(root, {
      emptyStateTitle: 'No personal rows yet',
      emptyStateDescription: 'Create your first private row to start building your personal dataset.',
      userId
    });
  } catch (error) {
    feedback.textContent = 'Failed to delete referral entry. Check authentication and Firestore access.';
  }
}

function getAuthErrorMessage(error) {
  const code = error && typeof error === 'object' && 'code' in error ? error.code : '';

  switch (code) {
    case 'auth/email-already-in-use':
      return 'That email is already registered. Try logging in instead.';
    case 'auth/invalid-email':
      return 'Enter a valid email address.';
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Email or password is incorrect.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in was cancelled.';
    default:
      return 'Authentication failed. Check your details and try again.';
  }
}

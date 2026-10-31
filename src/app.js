import { onAuthStateChanged } from 'firebase/auth';
import {
  auth,
  logInWithEmail,
  reloadCurrentUser,
  resendVerificationEmail,
  resetPassword,
  signInWithGoogle,
  signOutUser,
  signUpWithEmail
} from './firebase/auth.js';
import { buildEmailAuthViewModel } from './features/auth/emailAuthViewModel.js';
import { buildHomeViewModel } from './features/home/homeViewModel.js';
import { renderHomeView } from './features/home/homeView.js';
import {
  createUserRow,
  deleteUserRow,
  listUserRows,
  publishUserRow,
  unpublishUserRow,
  updateUserRow
} from './features/privateRows/privateRows.api.js';
import { buildProfileViewModel } from './features/privateRows/profileViewModel.js';
import { referralCategories } from './features/privateRows/privateRows.model.js';
import { renderPrivateRows } from './features/privateRows/privateRows.ui.js';
import { listPublicRows } from './features/publicRows/publicRows.api.js';
import {
  groupPublicRowsByCompany,
  pickRandomPublicRow
} from './features/publicRows/publicRows.model.js';
import { renderPublicRows } from './features/publicRows/publicRows.ui.js';
import { getHashPath, navigateTo, resolveRoute, routes } from './router.js';

export function initApp(root) {
  let currentUser = auth.currentUser;
  let emailAuthMode = 'login';

  const render = () => {
    const nextRoute = resolveRoute(
      window.location.hash,
      Boolean(currentUser),
      Boolean(currentUser?.emailVerified)
    );
    const currentPath = getHashPath(window.location.hash);

    if (nextRoute !== currentPath) {
      navigateTo(nextRoute);
      return;
    }

    if (nextRoute === routes.home) {
      renderHomePage(
        root,
        currentUser,
        emailAuthMode,
        (nextMode) => {
          emailAuthMode = nextMode;
          render();
        },
        refreshUser
      );
      return;
    }

    renderProfilePage(root, currentUser);
  };

  const refreshUser = async () => {
    const refreshedUser = await reloadCurrentUser();

    if (!refreshedUser) {
      return false;
    }

    currentUser = refreshedUser;

    if (refreshedUser.emailVerified) {
      render();
    }

    return refreshedUser.emailVerified;
  };

  onAuthStateChanged(auth, (user) => {
    currentUser = user;

    if (!user) {
      emailAuthMode = 'login';
    }

    render();
  });

  window.addEventListener('hashchange', render);
  render();
}

function renderHomePage(root, user, emailAuthMode, setEmailAuthMode, refreshUser) {
  const viewModel = buildHomeViewModel(user);
  const emailAuthViewModel = buildEmailAuthViewModel(emailAuthMode);

  root.innerHTML = renderHomeView(viewModel, emailAuthViewModel);

  if (viewModel.isAuthenticated) {
    root.querySelector('#logout-button')?.addEventListener('click', async () => {
      await signOutUser();
      navigateTo(routes.home);
    });

    if (viewModel.showProfileButton) {
      root.querySelector('#open-profile-button')?.addEventListener('click', () => {
        navigateTo(routes.profile);
      });
    }

    if (viewModel.showVerificationBanner) {
      wireVerificationActions(root, refreshUser);
    }
  } else {
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
  }

  void loadPublicCatalog(root);
}

function wireVerificationActions(root, refreshUser) {
  const feedback = root.querySelector('#verification-feedback');

  root.querySelector('#resend-verification-button')?.addEventListener('click', async () => {
    if (feedback) {
      feedback.textContent = 'Sending verification email...';
    }

    try {
      await resendVerificationEmail();

      if (feedback) {
        feedback.textContent = 'Verification email sent. Check your inbox.';
      }
    } catch (error) {
      if (feedback) {
        feedback.textContent = getAuthErrorMessage(error);
      }
    }
  });

  root.querySelector('#refresh-verification-button')?.addEventListener('click', async () => {
    if (feedback) {
      feedback.textContent = 'Checking verification status...';
    }

    try {
      const isVerified = await refreshUser();

      if (!isVerified && feedback) {
        feedback.textContent = 'Email is not confirmed yet. Check your inbox and try again.';
      }
    } catch (error) {
      if (feedback) {
        feedback.textContent = 'Could not refresh verification status. Try again.';
      }
    }
  });
}

function renderProfilePage(root, user) {
  const viewModel = buildProfileViewModel(user);
  const categoryOptions = buildCategoryOptions();

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
              <span>Category</span>
              <select name="category" required>
                <option value="" selected disabled>Select category</option>
                ${categoryOptions}
              </select>
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

async function loadPublicCatalog(root) {
  const container = root.querySelector('#public-catalog-container');
  if (!container) {
    return;
  }

  container.innerHTML = `
    <div class="placeholder">
      <h2>Referral catalog</h2>
      <p>Loading published referral links...</p>
    </div>
  `;

  try {
    const rows = await listPublicRows();
    const groups = groupPublicRowsByCompany(rows);

    container.classList.remove('placeholder');
    container.innerHTML = renderPublicRows(groups);
    wireCompanyCopyButtons(container, groups);
  } catch (error) {
    console.error('Failed to load public rows:', error);
    container.classList.add('placeholder');
    container.innerHTML = `
      <div class="placeholder">
        <h2>Referral catalog</h2>
        <p>Failed to load referral links. Check Firebase configuration and Firestore data.</p>
      </div>
    `;
  }
}

function wireCompanyCopyButtons(container, groups) {
  const feedback = container.querySelector('#public-catalog-feedback');

  for (const button of container.querySelectorAll('[data-company-key]')) {
    button.addEventListener('click', async () => {
      const companyKey = button.getAttribute('data-company-key');
      const group = groups.find((candidate) => candidate.companyKey === companyKey);
      const row = group ? pickRandomPublicRow(group.links) : null;

      if (!group || !row) {
        return;
      }

      try {
        if (!navigator.clipboard?.writeText) {
          throw new Error('Clipboard is unavailable.');
        }

        await navigator.clipboard.writeText(row.referralLink);

        if (feedback) {
          feedback.textContent = `Copied referral link for ${group.companyName}.`;
        }
      } catch (error) {
        if (feedback) {
          feedback.textContent = `Could not copy the referral link for ${group.companyName}.`;
        }
      }
    });
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
    category: formData.get('category'),
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
    console.error('Failed to create referral entry:', error);
    feedback.textContent = `Failed to create referral entry. ${getPrivateRowsErrorMessage(error)}`;
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
    const credential =
      mode === 'signup'
        ? await signUpWithEmail(input)
        : await logInWithEmail(input);

    form.reset();

    if (credential?.user?.emailVerified) {
      navigateTo(routes.profile);
      return;
    }

    navigateTo(routes.home);
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
    console.error('Failed to load private rows:', error);
    container.innerHTML = `
      <div class="placeholder">
        <h3>Failed to load referral entries</h3>
        <p>${getPrivateRowsErrorMessage(error)}</p>
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

    form.querySelector('[data-role="toggle-publish"]')?.addEventListener('click', () => {
      const rowId = form.getAttribute('data-row-id');
      if (!rowId) {
        return;
      }

      const isPublished = form.getAttribute('data-published') === 'true';
      void handleTogglePublish(root, userId, rowId, isPublished, form);
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

async function handleTogglePublish(root, userId, rowId, isPublished, form) {
  const feedback = form.querySelector('[data-role="edit-feedback"]');
  if (!feedback) {
    return;
  }

  feedback.textContent = isPublished ? 'Unpublishing referral entry...' : 'Publishing referral entry...';

  try {
    if (isPublished) {
      await unpublishUserRow(userId, rowId);
    } else {
      await publishUserRow(userId, rowId);
    }

    await loadPrivateRows(root, {
      emptyStateTitle: 'No personal rows yet',
      emptyStateDescription: 'Create your first private row to start building your personal dataset.',
      userId
    });
  } catch (error) {
    console.error('Failed to change publish state:', error);
    feedback.textContent = `Failed to ${isPublished ? 'unpublish' : 'publish'} referral entry. ${getPublicRowsErrorMessage(error)}`;
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
    category: formData.get('category'),
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
    feedback.textContent = `Failed to update referral entry. ${getPublicRowsErrorMessage(error)}`;
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
    feedback.textContent = `Failed to delete referral entry. ${getPrivateRowsErrorMessage(error)}`;
  }
}

function getPrivateRowsErrorMessage(error) {
  const code = error && typeof error === 'object' && 'code' in error ? error.code : '';

  if (code === 'permission-denied') {
    return 'Confirm your email to access your referral entries.';
  }

  return 'Check authentication and Firestore access, then try again.';
}

function getPublicRowsErrorMessage(error) {
  const code = error && typeof error === 'object' && 'code' in error ? error.code : '';

  if (code === 'permission-denied') {
    return 'Confirm your email to manage published referral entries.';
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Check authentication and Firestore access, then try again.';
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
    case 'auth/too-many-requests':
      return 'Too many attempts. Try again later.';
    case 'auth/unauthorized-continue-uri':
      return 'This domain is not authorized for email verification links.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.';
    default:
      return 'Authentication failed. Check your details and try again.';
  }
}

function buildCategoryOptions(selectedCategory = '') {
  return referralCategories
    .map((category) => {
      const selected = category === selectedCategory ? ' selected' : '';
      return `<option value="${escapeHtml(category)}"${selected}>${escapeHtml(category)}</option>`;
    })
    .join('');
}

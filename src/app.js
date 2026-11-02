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
import {
  buildPrivateRowInput,
  referralCategories,
  validatePrivateRowInput
} from './features/privateRows/privateRows.model.js';
import {
  renderPrivateRowCard,
  renderPrivateRows,
  renderPrivateRowsEmptyState,
  setRowEditMode
} from './features/privateRows/privateRows.ui.js';
import { renderCollapsibleForm } from './features/ui/collapsibleForm.js';
import {
  incrementPublicRowClicks,
  listPublicRows
} from './features/publicRows/publicRows.api.js';
import {
  filterPublicRows,
  groupPublicRowsByCompany,
  pickRandomPublicRow
} from './features/publicRows/publicRows.model.js';
import { renderPublicRows } from './features/publicRows/publicRows.ui.js';
import { getHashPath, navigateTo, resolveRoute, routes } from './router.js';

let profileToastTimer;

let catalogQuery = '';
let catalogCategory = '';
let catalogCategories = [];

export function initApp(root) {
  let currentUser = auth.currentUser;
  let emailAuthMode = 'login';
  let loginOpen = false;

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
        refreshUser,
        loginOpen
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
      loginOpen = false;
      catalogQuery = '';
      catalogCategory = '';
      catalogCategories = [];
    }

    render();
  });

  window.addEventListener('hashchange', render);
  render();
}

function renderHomePage(root, user, emailAuthMode, setEmailAuthMode, refreshUser, loginOpen) {
  const viewModel = buildHomeViewModel(user);
  const emailAuthViewModel = buildEmailAuthViewModel(emailAuthMode);

  root.innerHTML = renderHomeView(viewModel, emailAuthViewModel, {
    groups: [],
    categories: catalogCategories,
    selectedCategory: catalogCategory,
    query: catalogQuery
  }, loginOpen);

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

    root.querySelector('[data-role="open-login"]')?.addEventListener('click', () => {
      renderHomePage(root, user, emailAuthMode, setEmailAuthMode, refreshUser, !loginOpen);
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

    const catalogSearchInput = root.querySelector('.catalog-search__input');
    catalogSearchInput?.addEventListener('input', () => {
      catalogQuery = catalogSearchInput.value ?? '';
      void loadPublicCatalog(root);
    });

    root.querySelectorAll('.chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        catalogCategory = chip.dataset.category ?? '';
        void loadPublicCatalog(root);
      });
    });

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
          <button id="collapsible-add-toggle" class="action-button secondary-button" type="button" data-collapsible-open>Show add referral entry</button>
          <div id="collapsible-form-container"></div>
        </section>
      </section>
      <div id="profile-toast" class="profile-toast" role="status" aria-live="polite" hidden></div>
    </main>
  `;

  root.querySelector('#logout-button')?.addEventListener('click', async () => {
    await signOutUser();
    navigateTo(routes.home);
  });

  root.querySelector('#back-home-button')?.addEventListener('click', () => {
    navigateTo(routes.home);
  });

  const createForm = root.querySelector('#collapsible-form');
  createForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    void handleCreateUserRow(root, viewModel, event.currentTarget);
  });
  createForm?.addEventListener('input', handlePrivateRowsInput);
  createForm?.addEventListener('change', handlePrivateRowsInput);

  const collapsibleAddToggle = root.querySelector('#collapsible-add-toggle');
  const collapsibleFormContainer = root.querySelector('#collapsible-form-container');
  collapsibleAddToggle?.addEventListener('click', () => {
    const shouldOpen = collapsibleAddToggle.dataset.open !== 'true';
    collapsibleAddToggle.dataset.open = shouldOpen ? 'true' : '';
    collapsibleFormContainer.innerHTML = shouldOpen
      ? renderCollapsibleForm({ isOpen: true })
      : '';
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
    const filteredRows = filterPublicRows(rows, { query: catalogQuery, category: catalogCategory });
    const groups = groupPublicRowsByCompany(filteredRows);
    catalogCategories = [...new Set(groups.flatMap((group) => group.categories))].sort();

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

        try {
          await incrementPublicRowClicks(row.id);
        } catch (error) {
          console.error('Failed to record referral click:', error);
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

async function handleCreateUserRow(root, viewModel, form) {
  const formData = new FormData(form);
  const input = {
    companyName: formData.get('companyName'),
    category: formData.get('category'),
    referralLink: formData.get('referralLink'),
    bonusDescription: formData.get('bonusDescription')
  };
  const validation = validatePrivateRowInput(input);

  if (!validation.isValid) {
    showFormErrors(form, validation.errors);
    showProfileToast(root, 'Fix the highlighted fields.');
    return;
  }

  clearFormErrors(form);

  try {
    const createdRowRef = await createUserRow(viewModel.userId, input);
    const rowInput = buildPrivateRowInput(input);
    const createdRow = {
      id: createdRowRef.id,
      ...rowInput,
      isPublished: false,
      publicRowId: '',
      views: 0,
      clicks: 0
    };

    form.reset();
    clearFormErrors(form);

    if (!appendPrivateRow(root, createdRow)) {
      await loadPrivateRows(root, viewModel);
    }

    showProfileToast(root, 'Referral entry created.');
  } catch (error) {
    console.error('Failed to create referral entry:', error);
    showProfileToast(root, `Failed to create referral entry. ${getPrivateRowsErrorMessage(error)}`);
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

  const emptyState = {
    title: viewModel.emptyStateTitle,
    description: viewModel.emptyStateDescription
  };

  container.innerHTML = `
      <div class="placeholder">
        <h3>Loading referral entries...</h3>
        <p>Fetching your private data from Firestore.</p>
      </div>
  `;

  try {
    const rows = await listUserRows(viewModel.userId);
    container.innerHTML = renderPrivateRows(rows, emptyState);
    wirePrivateRowActions(container, root, viewModel.userId, rows, emptyState);
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

function wirePrivateRowActions(container, root, userId, rows, emptyState) {
  container.__privateRowsContext = {
    root,
    userId,
    rowsById: new Map(rows.map((row) => [row.id, row])),
    emptyState
  };

  if (container.__privateRowsActionsWired) {
    return;
  }

  container.__privateRowsActionsWired = true;
  container.addEventListener('click', handlePrivateRowsClick);
  container.addEventListener('submit', handlePrivateRowsSubmit);
  container.addEventListener('input', handlePrivateRowsInput);
  container.addEventListener('change', handlePrivateRowsInput);
}

function getPrivateRowsContext(container) {
  return container.__privateRowsContext ?? null;
}

function handlePrivateRowsClick(event) {
  const container = event.currentTarget;
  const context = getPrivateRowsContext(container);
  const action = event.target.closest('[data-action], [data-role]');

  if (!context || !action || !container.contains(action)) {
    return;
  }

  const card = action.closest('.private-row-card');
  const row = card ? context.rowsById.get(card.dataset.rowId) : null;

  if (!card || !row) {
    return;
  }

  switch (action.dataset.action || action.dataset.role) {
    case 'edit':
    case 'edit-row':
      setRowEditMode(card, true);
      break;
    case 'cancel-edit': {
      const form = card.querySelector('.private-row-edit-form');
      if (form) {
        form.reset();
        clearFormErrors(form);
      }
      setRowEditMode(card, false);
      break;
    }
    case 'delete':
    case 'delete-row':
      void handleDeleteUserRow(container, context, card, row);
      break;
    case 'unpublish':
    case 'publish':
    case 'toggle-publish':
      void handleTogglePublish(context, card, row);
      break;
    default:
      break;
  }
}

function handlePrivateRowsSubmit(event) {
  const container = event.currentTarget;
  const context = getPrivateRowsContext(container);
  const form = event.target.closest('.private-row-edit-form');

  if (!context || !form) {
    return;
  }

  event.preventDefault();

  const card = form.closest('.private-row-card');
  const row = card ? context.rowsById.get(card.dataset.rowId) : null;

  if (!card || !row) {
    return;
  }

  void handleUpdateUserRow(context, card, row, form);
}

function handlePrivateRowsInput(event) {
  const field = event.target;
  const form = field.closest('form');

  if (!form || !field.name) {
    return;
  }

  clearFieldError(form, field.name);
}

async function handleTogglePublish(context, card, row) {
  const { root, userId } = context;

  try {
    if (row.isPublished) {
      await unpublishUserRow(userId, row.id);
      row.isPublished = false;
      row.publicRowId = '';
      row.clicks = 0;
      showProfileToast(root, 'Referral entry unpublished.');
    } else {
      const publicRowId = await publishUserRow(userId, row.id);
      row.isPublished = true;
      row.publicRowId = publicRowId;
      row.clicks = 0;
      showProfileToast(root, 'Referral entry published.');
    }

    context.rowsById.set(row.id, row);
    replacePrivateRowCard(card, row);
  } catch (error) {
    console.error('Failed to change publish state:', error);
    showProfileToast(
      root,
      `Failed to ${row.isPublished ? 'unpublish' : 'publish'} referral entry. ${getPublicRowsErrorMessage(error)}`
    );
  }
}

async function handleUpdateUserRow(context, card, row, form) {
  const { root, userId } = context;
  const formData = new FormData(form);
  const input = {
    companyName: formData.get('companyName'),
    category: formData.get('category'),
    referralLink: formData.get('referralLink'),
    bonusDescription: formData.get('bonusDescription')
  };
  const validation = validatePrivateRowInput(input);

  if (!validation.isValid) {
    showFormErrors(form, validation.errors);
    showProfileToast(root, 'Fix the highlighted fields.');
    return;
  }

  clearFormErrors(form);

  try {
    await updateUserRow(userId, row.id, input);
    const updatedRow = { ...row, ...buildPrivateRowInput(input) };
    context.rowsById.set(updatedRow.id, updatedRow);
    replacePrivateRowCard(card, updatedRow);
    showProfileToast(root, 'Referral entry updated.');
  } catch (error) {
    showProfileToast(root, `Failed to update referral entry. ${getPublicRowsErrorMessage(error)}`);
  }
}

async function handleDeleteUserRow(container, context, card, row) {
  const { root, userId } = context;
  const confirmed = window.confirm(
    `Delete the referral entry for "${row.companyName || 'this company'}"? This cannot be undone.`
  );

  if (!confirmed) {
    return;
  }

  try {
    await deleteUserRow(userId, row.id);
    context.rowsById.delete(row.id);
    card.remove();

    if (!container.querySelector('.private-row-card')) {
      container.innerHTML = renderPrivateRowsEmptyState(context.emptyState);
    }

    showProfileToast(root, 'Referral entry deleted.');
  } catch (error) {
    showProfileToast(root, `Failed to delete referral entry. ${getPrivateRowsErrorMessage(error)}`);
  }
}

function replacePrivateRowCard(card, row) {
  card.outerHTML = renderPrivateRowCard(row);
}

function appendPrivateRow(root, row) {
  const container = root.querySelector('#private-rows-container');
  const context = container ? getPrivateRowsContext(container) : null;

  if (!container || !context) {
    return false;
  }

  context.rowsById.set(row.id, row);

  const list = container.querySelector('.private-row-list');
  if (list) {
    list.insertAdjacentHTML('beforeend', renderPrivateRowCard(row));
    return true;
  }

  container.innerHTML = renderPrivateRows([row], context.emptyState);
  return true;
}

function showProfileToast(root, message) {
  const toast = root.querySelector('#profile-toast');
  if (!toast) {
    return;
  }

  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(profileToastTimer);
  profileToastTimer = window.setTimeout(() => {
    toast.hidden = true;
  }, 4000);
}

function showFormErrors(form, errors) {
  for (const [fieldName, message] of Object.entries(errors)) {
    const error = form.querySelector(`[data-role="${fieldName}-error"]`);
    const field = form.elements.namedItem(fieldName);

    if (error) {
      error.textContent = message;
    }

    if (field && typeof field.setAttribute === 'function') {
      field.setAttribute('aria-invalid', message ? 'true' : 'false');
    }
  }
}

function clearFormErrors(form) {
  for (const error of form.querySelectorAll('[data-role$="-error"]')) {
    error.textContent = '';
  }

  for (const field of form.elements) {
    if (field.name) {
      field.setAttribute('aria-invalid', 'false');
    }
  }
}

function clearFieldError(form, fieldName) {
  const error = form.querySelector(`[data-role="${fieldName}-error"]`);
  const field = form.elements.namedItem(fieldName);

  if (error) {
    error.textContent = '';
  }

  if (field && typeof field.setAttribute === 'function') {
    field.setAttribute('aria-invalid', 'false');
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
    return 'Firestore denied the operation. Deploy the latest Firestore rules and check the referral entry fields.';
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

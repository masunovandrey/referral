import { onAuthStateChanged } from 'firebase/auth';
import { auth, signOutUser, startAuthUi, resetAuthUi } from './firebase/auth.js';
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

  const render = () => {
    const nextRoute = resolveRoute(window.location.hash, Boolean(currentUser));
    const currentPath = getHashPath(window.location.hash);

    if (nextRoute !== currentPath) {
      navigateTo(nextRoute);
      return;
    }

    if (nextRoute === routes.home) {
      renderHomePage(root, currentUser);
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

function renderHomePage(root, user) {
  const viewModel = buildHomeViewModel(user);
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
        <div id="firebaseui-auth-container"></div>
      </section>
    </main>
  `;

  if (viewModel.isAuthenticated) {
    resetAuthUi();
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

  startAuthUi('#firebaseui-auth-container', () => {
    navigateTo(routes.profile);
  });

  wirePublicDataButtons(root);
}

function renderProfilePage(root, user) {
  const viewModel = buildProfileViewModel(user);
  resetAuthUi();

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
          <h2>Add a personal row</h2>
          <form id="private-row-form" class="profile-form">
            <label class="field">
              <span>Title</span>
              <input name="title" type="text" autocomplete="off" />
            </label>
            <label class="field">
              <span>Description</span>
              <textarea name="description" rows="4"></textarea>
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

async function handleCreateUserRow(root, userId, form) {
  const feedback = root.querySelector('#private-row-feedback');
  if (!feedback) {
    return;
  }

  const formData = new FormData(form);
  const input = {
    title: formData.get('title'),
    description: formData.get('description')
  };

  feedback.textContent = 'Saving personal row...';

  try {
    await createUserRow(userId, input);
    form.reset();
    feedback.textContent = 'Personal row created.';
    await loadPrivateRows(root, {
      emptyStateTitle: 'No personal rows yet',
      emptyStateDescription: 'Create your first private row to start building your personal dataset.',
      userId
    });
  } catch (error) {
    feedback.textContent = 'Failed to create personal row. Check authentication and Firestore access.';
  }
}

async function loadPrivateRows(root, viewModel) {
  const container = root.querySelector('#private-rows-container');
  if (!container) {
    return;
  }

  container.innerHTML = `
    <div class="placeholder">
      <h3>Loading personal rows...</h3>
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
        <h3>Failed to load personal rows</h3>
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
    title: formData.get('title'),
    description: formData.get('description')
  };

  feedback.textContent = 'Saving changes...';

  try {
    await updateUserRow(userId, rowId, input);
    feedback.textContent = 'Personal row updated.';
    await loadPrivateRows(root, {
      emptyStateTitle: 'No personal rows yet',
      emptyStateDescription: 'Create your first private row to start building your personal dataset.',
      userId
    });
  } catch (error) {
    feedback.textContent = 'Failed to update personal row. Check authentication and Firestore access.';
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
    feedback.textContent = 'Failed to delete personal row. Check authentication and Firestore access.';
  }
}

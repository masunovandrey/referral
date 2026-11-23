import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockNavigateTo } = vi.hoisted(() => ({ mockNavigateTo: vi.fn() }));

vi.mock('firebase/auth', () => ({
  browserLocalPersistence: {},
  onAuthStateChanged: (_auth, callback) => {
    callback({ uid: 'user-a', email: 'user@example.com', emailVerified: true });
    return () => {};
  },
  signOut: vi.fn(),
  GoogleAuthProvider: class { setCustomParameters() {} },
  setPersistence: vi.fn(),
  getAuth: vi.fn(() => ({})),
  signInWithPopup: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  sendEmailVerification: vi.fn(),
  updateProfile: vi.fn()
}));
vi.mock('../../src/firebase/app.js', () => ({ firebaseApp: {} }));
vi.mock('../../src/firebase/firestore.js', () => ({ db: {} }));
vi.mock('../../src/features/publicRows/publicRows.api.js', () => ({
  listPublicRows: vi.fn(async () => []),
  incrementPublicRowClicks: vi.fn(async () => {})
}));
vi.mock('../../src/router.js', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, navigateTo: (...args) => mockNavigateTo(...args) };
});

import { initApp } from '../../src/app.js';

describe('app header actions', () => {
  beforeEach(() => {
    mockNavigateTo.mockClear();
  });

  it('navigates to the profile page when the header profile action is clicked', () => {
    const root = document.createElement('div');
    document.body.appendChild(root);

    initApp(root);

    const profileButton = root.querySelector('[data-role="open-profile"]');
    expect(profileButton).not.toBeNull();

    profileButton.click();

    expect(mockNavigateTo).toHaveBeenCalledWith('/profile');

    root.remove();
  });

  it('opens the category menu when the burger toggle is clicked', () => {
    const root = document.createElement('div');
    document.body.appendChild(root);

    initApp(root);

    const toggle = root.querySelector('[data-role="category-menu-toggle"]');
    const dropdown = root.querySelector('[data-role="category-menu"]');
    expect(toggle).not.toBeNull();
    expect(dropdown).not.toBeNull();
    expect(dropdown.hidden).toBe(true);

    toggle.click();

    expect(dropdown.hidden).toBe(false);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');

    root.remove();
  });

  it('closes the category menu and applies the selected category', () => {
    const root = document.createElement('div');
    document.body.appendChild(root);

    initApp(root);

    const toggle = root.querySelector('[data-role="category-menu-toggle"]');
    const dropdown = root.querySelector('[data-role="category-menu"]');
    const allItem = root.querySelector('[data-category=""]');

    toggle.click();
    expect(dropdown.hidden).toBe(false);

    allItem.click();

    expect(dropdown.hidden).toBe(true);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');

    root.remove();
  });

  it('keeps category items clickable after the menu refreshes', async () => {
    const root = document.createElement('div');
    document.body.appendChild(root);

    initApp(root);

    const toggle = root.querySelector('[data-role="category-menu-toggle"]');
    const dropdown = root.querySelector('[data-role="category-menu"]');

    toggle.click();
    expect(dropdown.hidden).toBe(false);

    dropdown.querySelector('[data-category=""]').click();
    await Promise.resolve();

    toggle.click();
    expect(dropdown.hidden).toBe(false);

    dropdown.querySelector('[data-category=""]').click();

    expect(dropdown.hidden).toBe(true);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');

    root.remove();
  });
});

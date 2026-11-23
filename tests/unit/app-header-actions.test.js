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
});

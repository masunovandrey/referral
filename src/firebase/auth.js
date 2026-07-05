import * as firebaseui from 'firebaseui';
import {
  browserLocalPersistence,
  getAuth,
  setPersistence,
  signOut
} from 'firebase/auth';
import { firebaseApp } from './app.js';
import { createUiConfig } from './authUiConfig.js';

export const auth = getAuth(firebaseApp);
void setPersistence(auth, browserLocalPersistence);

export function startAuthUi(container, onSignedIn) {
  const ui = firebaseui.auth.AuthUI.getInstance() ?? new firebaseui.auth.AuthUI(auth);
  ui.start(container, createUiConfig(onSignedIn));
}

export function resetAuthUi() {
  const ui = firebaseui.auth.AuthUI.getInstance();
  if (ui) {
    ui.reset();
  }
}

export function signOutUser() {
  return signOut(auth);
}

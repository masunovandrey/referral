import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  setPersistence,
  signOut
} from 'firebase/auth';
import { firebaseApp } from './app.js';

export const auth = getAuth(firebaseApp);
void setPersistence(auth, browserLocalPersistence);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export function signOutUser() {
  return signOut(auth);
}

export function signInWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}

export function signUpWithEmail({ name, email, password }) {
  return createUserWithEmailAndPassword(auth, email, password).then(async (credential) => {
    if (name && credential.user) {
      const { updateProfile } = await import('firebase/auth');
      await updateProfile(credential.user, { displayName: name });
    }

    return credential;
  });
}

export function logInWithEmail({ email, password }) {
  return signInWithEmailAndPassword(auth, email, password);
}

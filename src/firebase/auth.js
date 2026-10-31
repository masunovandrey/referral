import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail,
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

    if (credential.user) {
      await sendVerificationEmail(credential.user).catch((error) => {
        console.error('Failed to send verification email:', error);
      });
    }

    return credential;
  });
}

export function resendVerificationEmail() {
  const user = auth.currentUser;

  if (!user) {
    return Promise.reject(new Error('No authenticated user'));
  }

  return sendVerificationEmail(user);
}

export async function reloadCurrentUser() {
  const user = auth.currentUser;

  if (!user) {
    return null;
  }

  await user.reload();
  await user.getIdToken(true);

  return auth.currentUser;
}

function sendVerificationEmail(user) {
  return sendEmailVerification(user, {
    url: `${window.location.origin}${window.location.pathname}`,
    handleCodeInApp: false
  });
}

export function logInWithEmail({ email, password }) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function resetPassword(email) {
  return sendPasswordResetEmail(auth, email);
}

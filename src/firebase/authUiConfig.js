import { EmailAuthProvider, GithubAuthProvider, GoogleAuthProvider } from 'firebase/auth';

export function createUiConfig(onSignedIn) {
  return {
    signInFlow: 'popup',
    signInSuccessUrl: '#/app',
    signInOptions: [
      EmailAuthProvider.PROVIDER_ID,
      {
        provider: GoogleAuthProvider.PROVIDER_ID,
        customParameters: {
          prompt: 'select_account'
        }
      },
      GithubAuthProvider.PROVIDER_ID
    ],
    callbacks: {
      signInSuccessWithAuthResult: () => {
        onSignedIn();
        return false;
      }
    }
  };
}

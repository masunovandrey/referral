export function buildEmailAuthViewModel(mode) {
  if (mode === 'signup') {
    return {
      mode: 'signup',
      title: 'Sign up with email',
      submitLabel: 'Create account',
      toggleLabel: 'Already have an account? Log in',
      showNameField: true
    };
  }

  return {
    mode: 'login',
    title: 'Log in with email',
    submitLabel: 'Log in',
    toggleLabel: 'Need an account? Sign up',
    showNameField: false
  };
}

let toastMessage = '';
const listeners = new Set();

export function showToast(message) {
  toastMessage = message;

  for (const listener of listeners) {
    listener(toastMessage);
  }
}

export function getToastMessage() {
  return toastMessage;
}

export function clearToast() {
  toastMessage = '';

  for (const listener of listeners) {
    listener(toastMessage);
  }
}

export function subscribeToToasts(listener) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

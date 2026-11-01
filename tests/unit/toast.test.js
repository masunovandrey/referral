import { beforeEach, describe, expect, it } from 'vitest';
import { clearToast, getToastMessage, showToast } from '../../src/features/ui/toast.js';

describe('toast', () => {
  beforeEach(() => {
    clearToast();
  });

  it('stores the last shown message', () => {
    showToast('Referral link is copied');

    expect(getToastMessage()).toBe('Referral link is copied');
  });

  it('clears the message', () => {
    showToast('Referral link is copied');
    clearToast();

    expect(getToastMessage()).toBe('');
  });
});

import { describe, expect, it } from 'vitest';
import { buildPrivateRowActions } from '../../src/features/privateRows/privateRows.model.js';

describe('buildPrivateRowActions', () => {
  it('returns the expected row-level action labels', () => {
    expect(buildPrivateRowActions()).toEqual({
      saveLabel: 'Save changes',
      deleteLabel: 'Delete row'
    });
  });
});

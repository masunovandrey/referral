// @vitest-environment node
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment
} from '@firebase/rules-unit-testing';
import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';
import { deleteDoc, doc, getDoc, increment, setDoc, updateDoc } from 'firebase/firestore';

const projectId = 'demo-referral';

let testEnv;

const privateRow = {
  companyName: 'Acme',
  companyKey: 'acme',
  category: 'fintech',
  referralLink: 'https://acme.example/referral',
  bonusDescription: 'Bonus details',
  isPublished: true,
  publicRowId: 'user-a_acme',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z')
};

const publicRow = {
  companyName: 'Acme',
  companyKey: 'acme',
  category: 'fintech',
  referralLink: 'https://acme.example/referral',
  bonusDescription: 'Bonus details',
  ownerUid: 'user-a',
  sourceRowId: 'seed-private-row',
  clicks: 0,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z')
};

const newPublicRow = {
  ...publicRow,
  companyName: 'New Co',
  companyKey: 'new',
  sourceRowId: 'second-private-row'
};

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId,
    firestore: {
      rules: readFileSync('firestore.rules', 'utf8')
    }
  });
});

beforeEach(async () => {
  await testEnv.clearFirestore();
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();

    await setDoc(doc(db, 'users/user-a/rows/seed-private-row'), privateRow);
    await setDoc(doc(db, 'users/user-a/rows/second-private-row'), {
      ...privateRow,
      companyName: 'New Co',
      companyKey: 'new'
    });
    await setDoc(doc(db, 'users/user-b/rows/seed-private-row'), privateRow);
    await setDoc(doc(db, 'publicRows/user-a_acme'), publicRow);
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

describe('publicRows security rules', () => {
  it('allows anonymous users to read public rows', async () => {
    const db = testEnv.unauthenticatedContext().firestore();

    await assertSucceeds(getDoc(doc(db, 'publicRows/user-a_acme')));
  });

  it('allows authenticated users to read public rows', async () => {
    const db = testEnv.authenticatedContext('user-a').firestore();

    await assertSucceeds(getDoc(doc(db, 'publicRows/user-a_acme')));
  });

  it('blocks anonymous users from creating public rows', async () => {
    const db = testEnv.unauthenticatedContext().firestore();

    await assertFails(setDoc(doc(db, 'publicRows/user-a_new'), newPublicRow));
  });

  it('blocks unverified users from creating public rows', async () => {
    const db = testEnv.authenticatedContext('user-a', { email_verified: false }).firestore();

    await assertFails(setDoc(doc(db, 'publicRows/user-a_new'), newPublicRow));
  });

  it('allows verified owners to create a public row from their private row', async () => {
    const db = testEnv.authenticatedContext('user-a', { email_verified: true }).firestore();

    await assertSucceeds(setDoc(doc(db, 'publicRows/user-a_new'), newPublicRow));
  });

  it('blocks creating a public row with a non-zero click count', async () => {
    const db = testEnv.authenticatedContext('user-a', { email_verified: true }).firestore();

    await assertFails(
      setDoc(doc(db, 'publicRows/user-a_new'), { ...newPublicRow, clicks: 1 })
    );
  });

  it('blocks creating a public row with a non-deterministic id', async () => {
    const db = testEnv.authenticatedContext('user-a', { email_verified: true }).firestore();

    await assertFails(setDoc(doc(db, 'publicRows/random-id'), newPublicRow));
  });

  it('blocks creating a public row for another owner', async () => {
    const db = testEnv.authenticatedContext('user-a', { email_verified: true }).firestore();

    await assertFails(
      setDoc(doc(db, 'publicRows/user-a_new'), { ...newPublicRow, ownerUid: 'user-b' })
    );
  });

  it('blocks creating a public row without a matching private source row', async () => {
    const db = testEnv.authenticatedContext('user-a', { email_verified: true }).firestore();

    await assertFails(
      setDoc(doc(db, 'publicRows/user-a_new'), {
        ...newPublicRow,
        sourceRowId: 'missing-private-row'
      })
    );
  });

  it('blocks anonymous users from updating public rows', async () => {
    const db = testEnv.unauthenticatedContext().firestore();

    await assertFails(
      updateDoc(doc(db, 'publicRows/user-a_acme'), {
        companyName: 'Changed Acme',
        updatedAt: new Date('2026-01-02T00:00:00.000Z')
      })
    );
  });

  it('allows anonymous users to increment clicks by one', async () => {
    const db = testEnv.unauthenticatedContext().firestore();

    await assertSucceeds(
      updateDoc(doc(db, 'publicRows/user-a_acme'), { clicks: increment(1) })
    );
  });

  it('allows authenticated users to increment clicks by one', async () => {
    const db = testEnv.authenticatedContext('user-b', { email_verified: true }).firestore();

    await assertSucceeds(
      updateDoc(doc(db, 'publicRows/user-a_acme'), { clicks: increment(1) })
    );
  });

  it('blocks incrementing clicks by more than one', async () => {
    const db = testEnv.unauthenticatedContext().firestore();

    await assertFails(
      updateDoc(doc(db, 'publicRows/user-a_acme'), { clicks: increment(2) })
    );
  });

  it('blocks decrementing clicks', async () => {
    const db = testEnv.unauthenticatedContext().firestore();

    await assertFails(
      updateDoc(doc(db, 'publicRows/user-a_acme'), { clicks: increment(-1) })
    );
  });

  it('blocks changing other fields while incrementing clicks', async () => {
    const db = testEnv.unauthenticatedContext().firestore();

    await assertFails(
      updateDoc(doc(db, 'publicRows/user-a_acme'), {
        clicks: increment(1),
        companyName: 'Changed Acme'
      })
    );
  });

  it('blocks non-owners from updating public rows', async () => {
    const db = testEnv.authenticatedContext('user-b', { email_verified: true }).firestore();

    await assertFails(
      updateDoc(doc(db, 'publicRows/user-a_acme'), {
        companyName: 'Changed Acme',
        updatedAt: new Date('2026-01-02T00:00:00.000Z')
      })
    );
  });

  it('allows owners to update public row content', async () => {
    const db = testEnv.authenticatedContext('user-a', { email_verified: true }).firestore();

    await assertSucceeds(
      updateDoc(doc(db, 'publicRows/user-a_acme'), {
        companyName: 'Acme Updated',
        updatedAt: new Date('2026-01-02T00:00:00.000Z')
      })
    );
  });

  it('blocks owners from changing clicks during content updates', async () => {
    const db = testEnv.authenticatedContext('user-a', { email_verified: true }).firestore();

    await assertFails(
      updateDoc(doc(db, 'publicRows/user-a_acme'), {
        clicks: 1,
        updatedAt: new Date('2026-01-02T00:00:00.000Z')
      })
    );
  });

  it('blocks owners from changing ownership or source row', async () => {
    const db = testEnv.authenticatedContext('user-a', { email_verified: true }).firestore();

    await assertFails(
      updateDoc(doc(db, 'publicRows/user-a_acme'), {
        ownerUid: 'user-b',
        updatedAt: new Date('2026-01-02T00:00:00.000Z')
      })
    );
    await assertFails(
      updateDoc(doc(db, 'publicRows/user-a_acme'), {
        sourceRowId: 'second-private-row',
        updatedAt: new Date('2026-01-02T00:00:00.000Z')
      })
    );
  });

  it('blocks anonymous users from deleting public rows', async () => {
    const db = testEnv.unauthenticatedContext().firestore();

    await assertFails(deleteDoc(doc(db, 'publicRows/user-a_acme')));
  });

  it('blocks non-owners from deleting public rows', async () => {
    const db = testEnv.authenticatedContext('user-b', { email_verified: true }).firestore();

    await assertFails(deleteDoc(doc(db, 'publicRows/user-a_acme')));
  });

  it('allows owners to delete public rows', async () => {
    const db = testEnv.authenticatedContext('user-a', { email_verified: true }).firestore();

    await assertSucceeds(deleteDoc(doc(db, 'publicRows/user-a_acme')));
  });
});

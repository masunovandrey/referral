// @vitest-environment node
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment
} from '@firebase/rules-unit-testing';
import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';
import { deleteDoc, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const projectId = 'demo-referral-private-rows';

let testEnv;

const privateRow = {
  title: 'Private referral',
  description: 'User-owned private row',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z')
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
    await setDoc(doc(db, 'users/user-b/rows/seed-private-row'), privateRow);
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

describe('private user rows security rules', () => {
  it('blocks anonymous users from reading private rows', async () => {
    const db = testEnv.unauthenticatedContext().firestore();

    await assertFails(getDoc(doc(db, 'users/user-a/rows/seed-private-row')));
  });

  it('blocks anonymous users from creating private rows', async () => {
    const db = testEnv.unauthenticatedContext().firestore();

    await assertFails(setDoc(doc(db, 'users/user-a/rows/new-private-row'), privateRow));
  });

  it('blocks anonymous users from updating private rows', async () => {
    const db = testEnv.unauthenticatedContext().firestore();

    await assertFails(updateDoc(doc(db, 'users/user-a/rows/seed-private-row'), {
      title: 'Changed private referral',
      updatedAt: new Date('2026-01-02T00:00:00.000Z')
    }));
  });

  it('blocks anonymous users from deleting private rows', async () => {
    const db = testEnv.unauthenticatedContext().firestore();

    await assertFails(deleteDoc(doc(db, 'users/user-a/rows/seed-private-row')));
  });

  it('allows authenticated users to read their own rows', async () => {
    const db = testEnv.authenticatedContext('user-a').firestore();

    await assertSucceeds(getDoc(doc(db, 'users/user-a/rows/seed-private-row')));
  });

  it('allows authenticated users to create their own rows', async () => {
    const db = testEnv.authenticatedContext('user-a').firestore();

    await assertSucceeds(setDoc(doc(db, 'users/user-a/rows/new-private-row'), privateRow));
  });

  it('allows authenticated users to update their own rows', async () => {
    const db = testEnv.authenticatedContext('user-a').firestore();

    await assertSucceeds(updateDoc(doc(db, 'users/user-a/rows/seed-private-row'), {
      title: 'Changed private referral',
      updatedAt: new Date('2026-01-02T00:00:00.000Z')
    }));
  });

  it('allows authenticated users to delete their own rows', async () => {
    const db = testEnv.authenticatedContext('user-a').firestore();

    await assertSucceeds(deleteDoc(doc(db, 'users/user-a/rows/seed-private-row')));
  });

  it('blocks authenticated users from reading another user rows', async () => {
    const db = testEnv.authenticatedContext('user-a').firestore();

    await assertFails(getDoc(doc(db, 'users/user-b/rows/seed-private-row')));
  });

  it('blocks authenticated users from creating rows under another user UID', async () => {
    const db = testEnv.authenticatedContext('user-a').firestore();

    await assertFails(setDoc(doc(db, 'users/user-b/rows/new-private-row'), privateRow));
  });

  it('blocks authenticated users from updating another user rows', async () => {
    const db = testEnv.authenticatedContext('user-a').firestore();

    await assertFails(updateDoc(doc(db, 'users/user-b/rows/seed-private-row'), {
      title: 'Changed private referral',
      updatedAt: new Date('2026-01-02T00:00:00.000Z')
    }));
  });

  it('blocks authenticated users from deleting another user rows', async () => {
    const db = testEnv.authenticatedContext('user-a').firestore();

    await assertFails(deleteDoc(doc(db, 'users/user-b/rows/seed-private-row')));
  });
});

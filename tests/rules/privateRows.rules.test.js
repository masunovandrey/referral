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
  companyName: 'Private referral',
  companyKey: 'private%20referral',
  category: 'fintech',
  referralLink: 'https://example.com/referral',
  bonusDescription: 'User-owned private row',
  isPublished: false,
  publicRowId: '',
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
      companyName: 'Changed private referral',
      updatedAt: new Date('2026-01-02T00:00:00.000Z')
    }));
  });

  it('blocks anonymous users from deleting private rows', async () => {
    const db = testEnv.unauthenticatedContext().firestore();

    await assertFails(deleteDoc(doc(db, 'users/user-a/rows/seed-private-row')));
  });

  it('allows authenticated users to read their own rows', async () => {
    const db = testEnv.authenticatedContext('user-a', { email_verified: true }).firestore();

    await assertSucceeds(getDoc(doc(db, 'users/user-a/rows/seed-private-row')));
  });

  it('allows authenticated users to create their own rows', async () => {
    const db = testEnv.authenticatedContext('user-a', { email_verified: true }).firestore();

    await assertSucceeds(setDoc(doc(db, 'users/user-a/rows/new-private-row'), privateRow));
  });

  it('allows authenticated users to update their own rows', async () => {
    const db = testEnv.authenticatedContext('user-a', { email_verified: true }).firestore();

    await assertSucceeds(updateDoc(doc(db, 'users/user-a/rows/seed-private-row'), {
      companyName: 'Changed private referral',
      updatedAt: new Date('2026-01-02T00:00:00.000Z')
    }));
  });

  it('allows authenticated users to delete their own rows', async () => {
    const db = testEnv.authenticatedContext('user-a', { email_verified: true }).firestore();

    await assertSucceeds(deleteDoc(doc(db, 'users/user-a/rows/seed-private-row')));
  });

  it('blocks authenticated users from reading another user rows', async () => {
    const db = testEnv.authenticatedContext('user-a', { email_verified: true }).firestore();

    await assertFails(getDoc(doc(db, 'users/user-b/rows/seed-private-row')));
  });

  it('blocks authenticated users from creating rows under another user UID', async () => {
    const db = testEnv.authenticatedContext('user-a', { email_verified: true }).firestore();

    await assertFails(setDoc(doc(db, 'users/user-b/rows/new-private-row'), privateRow));
  });

  it('blocks authenticated users from updating another user rows', async () => {
    const db = testEnv.authenticatedContext('user-a', { email_verified: true }).firestore();

    await assertFails(updateDoc(doc(db, 'users/user-b/rows/seed-private-row'), {
      companyName: 'Changed private referral',
      updatedAt: new Date('2026-01-02T00:00:00.000Z')
    }));
  });

  it('blocks authenticated users from deleting another user rows', async () => {
    const db = testEnv.authenticatedContext('user-a', { email_verified: true }).firestore();

    await assertFails(deleteDoc(doc(db, 'users/user-b/rows/seed-private-row')));
  });

  it('blocks unverified users from reading their own rows', async () => {
    const db = testEnv.authenticatedContext('user-a', { email_verified: false }).firestore();

    await assertFails(getDoc(doc(db, 'users/user-a/rows/seed-private-row')));
  });

  it('blocks unverified users from creating their own rows', async () => {
    const db = testEnv.authenticatedContext('user-a', { email_verified: false }).firestore();

    await assertFails(setDoc(doc(db, 'users/user-a/rows/new-private-row'), privateRow));
  });

  it('blocks unverified users from updating their own rows', async () => {
    const db = testEnv.authenticatedContext('user-a', { email_verified: false }).firestore();

    await assertFails(updateDoc(doc(db, 'users/user-a/rows/seed-private-row'), {
      companyName: 'Changed private referral',
      updatedAt: new Date('2026-01-02T00:00:00.000Z')
    }));
  });

  it('blocks unverified users from deleting their own rows', async () => {
    const db = testEnv.authenticatedContext('user-a', { email_verified: false }).firestore();

    await assertFails(deleteDoc(doc(db, 'users/user-a/rows/seed-private-row')));
  });

  it('blocks creating private rows with an unknown category', async () => {
    const db = testEnv.authenticatedContext('user-a', { email_verified: true }).firestore();

    await assertFails(setDoc(doc(db, 'users/user-a/rows/bad-category-row'), {
      ...privateRow,
      companyName: 'Bad Category Co',
      companyKey: 'bad%20category%20co',
      category: 'not-a-category'
    }));
  });

  it('blocks creating private rows without a referral link', async () => {
    const db = testEnv.authenticatedContext('user-a', { email_verified: true }).firestore();

    await assertFails(setDoc(doc(db, 'users/user-a/rows/no-referral-row'), {
      ...privateRow,
      companyName: 'No Referral Co',
      companyKey: 'no%20referral%20co',
      referralLink: ''
    }));
  });

  it('blocks creating private rows with an overlong company name', async () => {
    const db = testEnv.authenticatedContext('user-a', { email_verified: true }).firestore();

    await assertFails(setDoc(doc(db, 'users/user-a/rows/long-company-row'), {
      ...privateRow,
      companyName: 'a'.repeat(121),
      companyKey: 'a'.repeat(121)
    }));
  });

  it('blocks updating private rows with an invalid category', async () => {
    const db = testEnv.authenticatedContext('user-a', { email_verified: true }).firestore();

    await assertFails(updateDoc(doc(db, 'users/user-a/rows/seed-private-row'), {
      category: 'not-a-category',
      updatedAt: new Date('2026-01-02T00:00:00.000Z')
    }));
  });

  it('blocks updating private rows by changing createdAt', async () => {
    const db = testEnv.authenticatedContext('user-a', { email_verified: true }).firestore();

    await assertFails(updateDoc(doc(db, 'users/user-a/rows/seed-private-row'), {
      createdAt: new Date('2026-01-02T00:00:00.000Z')
    }));
  });
});

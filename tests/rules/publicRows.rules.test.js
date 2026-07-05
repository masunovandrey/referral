// @vitest-environment node
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment
} from '@firebase/rules-unit-testing';
import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';
import { deleteDoc, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const projectId = 'demo-referral';

let testEnv;

const publicRow = {
  title: 'Public referral',
  description: 'Visible public row',
  visible: true,
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
    await setDoc(doc(context.firestore(), 'publicRows/seed-public-row'), publicRow);
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

describe('publicRows security rules', () => {
  it('allows anonymous users to read public rows', async () => {
    const db = testEnv.unauthenticatedContext().firestore();

    await assertSucceeds(getDoc(doc(db, 'publicRows/seed-public-row')));
  });

  it('allows authenticated users to read public rows', async () => {
    const db = testEnv.authenticatedContext('user-a').firestore();

    await assertSucceeds(getDoc(doc(db, 'publicRows/seed-public-row')));
  });

  it('blocks anonymous users from creating public rows', async () => {
    const db = testEnv.unauthenticatedContext().firestore();

    await assertFails(setDoc(doc(db, 'publicRows/new-public-row'), publicRow));
  });

  it('blocks anonymous users from updating public rows', async () => {
    const db = testEnv.unauthenticatedContext().firestore();

    await assertFails(updateDoc(doc(db, 'publicRows/seed-public-row'), {
      title: 'Changed public referral',
      updatedAt: new Date('2026-01-02T00:00:00.000Z')
    }));
  });

  it('blocks anonymous users from deleting public rows', async () => {
    const db = testEnv.unauthenticatedContext().firestore();

    await assertFails(deleteDoc(doc(db, 'publicRows/seed-public-row')));
  });

  it('blocks authenticated users from creating public rows', async () => {
    const db = testEnv.authenticatedContext('user-a').firestore();

    await assertFails(setDoc(doc(db, 'publicRows/new-public-row'), publicRow));
  });

  it('blocks authenticated users from updating public rows', async () => {
    const db = testEnv.authenticatedContext('user-a').firestore();

    await assertFails(updateDoc(doc(db, 'publicRows/seed-public-row'), {
      title: 'Changed public referral',
      updatedAt: new Date('2026-01-02T00:00:00.000Z')
    }));
  });

  it('blocks authenticated users from deleting public rows', async () => {
    const db = testEnv.authenticatedContext('user-a').firestore();

    await assertFails(deleteDoc(doc(db, 'publicRows/seed-public-row')));
  });
});

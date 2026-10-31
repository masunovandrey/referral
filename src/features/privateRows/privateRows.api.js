import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from '../../firebase/firestore.js';
import {
  buildCompanyKey,
  buildPublicRowId
} from '../publicRows/publicRows.model.js';
import { buildPrivateRowInput, normalizePrivateRows } from './privateRows.model.js';

export async function listUserRows(uid) {
  const userRowsQuery = query(collection(db, `users/${uid}/rows`), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(userRowsQuery);

  return normalizePrivateRows(snapshot.docs);
}

export async function createUserRow(uid, input) {
  const rowInput = buildPrivateRowInput(input);

  return addDoc(collection(db, `users/${uid}/rows`), {
    ...rowInput,
    isPublished: false,
    publicRowId: '',
    views: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

export async function updateUserRow(uid, rowId, input) {
  const privateRef = doc(db, `users/${uid}/rows/${rowId}`);
  const privateSnapshot = await getDoc(privateRef);

  if (!privateSnapshot.exists()) {
    throw new Error('Referral entry not found.');
  }

  const existingRow = privateSnapshot.data();
  const rowInput = buildPrivateRowInput(input);
  const wasPublished = existingRow.isPublished === true;
  const oldCompanyKey =
    typeof existingRow.companyKey === 'string' && existingRow.companyKey
      ? existingRow.companyKey
      : buildCompanyKey(existingRow.companyName);
  const oldPublicRowId =
    typeof existingRow.publicRowId === 'string' && existingRow.publicRowId
      ? existingRow.publicRowId
      : oldCompanyKey
        ? buildPublicRowId(uid, oldCompanyKey)
        : '';
  const newPublicRowId = rowInput.companyKey
    ? buildPublicRowId(uid, rowInput.companyKey)
    : '';
  const batch = writeBatch(db);
  const privateUpdate = {
    ...rowInput,
    isPublished: wasPublished,
    publicRowId: wasPublished ? newPublicRowId : '',
    updatedAt: serverTimestamp()
  };

  if (wasPublished) {
    assertPublishable(rowInput);

    const newPublicRef = doc(db, 'publicRows', newPublicRowId);
    const newPublicSnapshot = await getDoc(newPublicRef);

    if (
      newPublicSnapshot.exists() &&
      newPublicSnapshot.data().sourceRowId !== rowId
    ) {
      throw new Error(
        'Another referral entry for this company is already published. Unpublish it first.'
      );
    }

    if (oldPublicRowId && oldPublicRowId !== newPublicRowId) {
      batch.delete(doc(db, 'publicRows', oldPublicRowId));
    }

    batch.set(
      newPublicRef,
      buildPublicRowPayload(
        rowInput,
        uid,
        rowId,
        newPublicSnapshot.exists() ? newPublicSnapshot.data() : null
      )
    );
  }

  batch.update(privateRef, privateUpdate);
  await batch.commit();
}

export async function deleteUserRow(uid, rowId) {
  const privateRef = doc(db, `users/${uid}/rows/${rowId}`);
  const privateSnapshot = await getDoc(privateRef);

  if (!privateSnapshot.exists()) {
    return;
  }

  const rowData = privateSnapshot.data();
  const companyKey =
    typeof rowData.companyKey === 'string' && rowData.companyKey
      ? rowData.companyKey
      : buildCompanyKey(rowData.companyName);
  const publicRowId =
    typeof rowData.publicRowId === 'string' && rowData.publicRowId
      ? rowData.publicRowId
      : companyKey
        ? buildPublicRowId(uid, companyKey)
        : '';
  const batch = writeBatch(db);

  if (rowData.isPublished === true && publicRowId) {
    const publicRef = doc(db, 'publicRows', publicRowId);
    const publicSnapshot = await getDoc(publicRef);

    if (publicSnapshot.exists() && publicSnapshot.data().sourceRowId === rowId) {
      batch.delete(publicRef);
    }
  }

  batch.delete(privateRef);
  await batch.commit();
}

export async function publishUserRow(uid, rowId) {
  const privateRef = doc(db, `users/${uid}/rows/${rowId}`);
  const privateSnapshot = await getDoc(privateRef);

  if (!privateSnapshot.exists()) {
    throw new Error('Referral entry not found.');
  }

  const rowData = privateSnapshot.data();
  let companyKey =
    typeof rowData.companyKey === 'string' && rowData.companyKey
      ? rowData.companyKey
      : buildCompanyKey(rowData.companyName);

  assertPublishable({ ...rowData, companyKey });

  if (rowData.companyKey !== companyKey) {
    await updateDoc(privateRef, {
      companyKey,
      updatedAt: serverTimestamp()
    });
  }

  const publicRowId = buildPublicRowId(uid, companyKey);
  const publicRef = doc(db, 'publicRows', publicRowId);
  const publicSnapshot = await getDoc(publicRef);

  if (publicSnapshot.exists() && publicSnapshot.data().sourceRowId !== rowId) {
    throw new Error(
      'Another referral entry for this company is already published. Unpublish it first.'
    );
  }

  const batch = writeBatch(db);
  const oldPublicRowId =
    typeof rowData.publicRowId === 'string' ? rowData.publicRowId : '';

  if (oldPublicRowId && oldPublicRowId !== publicRowId) {
    batch.delete(doc(db, 'publicRows', oldPublicRowId));
  }

  batch.set(
    publicRef,
    buildPublicRowPayload(
      { ...rowData, companyKey },
      uid,
      rowId,
      publicSnapshot.exists() ? publicSnapshot.data() : null
    )
  );
  batch.update(privateRef, {
    companyKey,
    isPublished: true,
    publicRowId,
    updatedAt: serverTimestamp()
  });
  await batch.commit();

  return publicRowId;
}

export async function unpublishUserRow(uid, rowId) {
  const privateRef = doc(db, `users/${uid}/rows/${rowId}`);
  const privateSnapshot = await getDoc(privateRef);

  if (!privateSnapshot.exists()) {
    throw new Error('Referral entry not found.');
  }

  const rowData = privateSnapshot.data();
  const companyKey =
    typeof rowData.companyKey === 'string' && rowData.companyKey
      ? rowData.companyKey
      : buildCompanyKey(rowData.companyName);
  const publicRowId =
    typeof rowData.publicRowId === 'string' && rowData.publicRowId
      ? rowData.publicRowId
      : companyKey
        ? buildPublicRowId(uid, companyKey)
        : '';
  const batch = writeBatch(db);

  if (publicRowId) {
    const publicRef = doc(db, 'publicRows', publicRowId);
    const publicSnapshot = await getDoc(publicRef);

    if (publicSnapshot.exists() && publicSnapshot.data().sourceRowId === rowId) {
      batch.delete(publicRef);
    }
  }

  batch.update(privateRef, {
    isPublished: false,
    publicRowId: '',
    updatedAt: serverTimestamp()
  });
  await batch.commit();
}

function assertPublishable(rowData) {
  if (!rowData.companyName || !rowData.companyKey) {
    throw new Error('Add a company name before publishing.');
  }

  if (!rowData.referralLink) {
    throw new Error('Add a referral link before publishing.');
  }

  if (!rowData.category) {
    throw new Error('Select a category before publishing.');
  }

  if (!/^https?:\/\//.test(rowData.referralLink)) {
    throw new Error('Referral link must start with http:// or https://.');
  }

  if (rowData.companyName.length > 120) {
    throw new Error('Company name must be 120 characters or fewer.');
  }

  if (rowData.companyKey.length > 1450) {
    throw new Error('Company name is too long to publish.');
  }

  if (rowData.category.length > 80) {
    throw new Error('Category must be 80 characters or fewer.');
  }

  if (rowData.referralLink.length > 2048) {
    throw new Error('Referral link must be 2048 characters or fewer.');
  }

  const bonusDescription =
    typeof rowData.bonusDescription === 'string' ? rowData.bonusDescription : '';

  if (bonusDescription.length > 1000) {
    throw new Error('Bonus description must be 1000 characters or fewer.');
  }
}

function buildPublicRowPayload(rowData, ownerUid, sourceRowId, existingPublicRow) {
  return {
    companyName: rowData.companyName,
    companyKey: rowData.companyKey,
    category: rowData.category,
    referralLink: rowData.referralLink,
    bonusDescription:
      typeof rowData.bonusDescription === 'string' ? rowData.bonusDescription : '',
    ownerUid,
    sourceRowId,
    clicks:
      existingPublicRow && Number.isInteger(existingPublicRow.clicks)
        ? existingPublicRow.clicks
        : 0,
    createdAt: existingPublicRow?.createdAt ?? serverTimestamp(),
    updatedAt: serverTimestamp()
  };
}

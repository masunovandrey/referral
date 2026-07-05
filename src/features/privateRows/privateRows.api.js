import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';
import { db } from '../../firebase/firestore.js';
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
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

export async function updateUserRow(uid, rowId, input) {
  const rowInput = buildPrivateRowInput(input);

  await updateDoc(doc(db, `users/${uid}/rows/${rowId}`), {
    ...rowInput,
    updatedAt: serverTimestamp()
  });
}

export async function deleteUserRow(uid, rowId) {
  await deleteDoc(doc(db, `users/${uid}/rows/${rowId}`));
}

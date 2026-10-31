import { collection, doc, getDocs, increment, limit, query, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/firestore.js';
import { normalizePublicRows } from './publicRows.model.js';

export const publicRowsLimit = 200;

export async function listPublicRows() {
  const publicRowsQuery = query(collection(db, 'publicRows'), limit(publicRowsLimit));
  const snapshot = await getDocs(publicRowsQuery);

  return normalizePublicRows(snapshot.docs);
}

export async function incrementPublicRowClicks(publicRowId) {
  if (!publicRowId) {
    return;
  }

  await updateDoc(doc(db, 'publicRows', publicRowId), {
    clicks: increment(1)
  });
}

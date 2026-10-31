import { collection, getDocs, limit, query } from 'firebase/firestore';
import { db } from '../../firebase/firestore.js';
import { normalizePublicRows } from './publicRows.model.js';

export const publicRowsLimit = 200;

export async function listPublicRows() {
  const publicRowsQuery = query(collection(db, 'publicRows'), limit(publicRowsLimit));
  const snapshot = await getDocs(publicRowsQuery);

  return normalizePublicRows(snapshot.docs);
}

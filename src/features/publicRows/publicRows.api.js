import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../../firebase/firestore.js';
import { normalizePublicRows } from './publicRows.model.js';

export async function listPublicRows() {
  const publicRowsQuery = query(collection(db, 'publicRows'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(publicRowsQuery);

  return normalizePublicRows(snapshot.docs);
}

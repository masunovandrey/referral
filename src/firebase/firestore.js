import { getFirestore } from 'firebase/firestore';
import { firebaseApp } from './app.js';

export const db = getFirestore(firebaseApp);

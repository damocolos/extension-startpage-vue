import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore/lite';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { config } from './config.js';

const app = initializeApp(config.firebaseConfig);
const auth = getAuth();
signInAnonymously(auth)
  .then(() => {})
  .catch((error) => {
    console.error(error);
  });

export const db = getFirestore(app);

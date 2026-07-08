import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Note: In Vite, env variables are accessed via import.meta.env
// However, since we might not have a VITE_ prefixed env for Firebase if we hardcode from config,
// we'll fetch from the generated firebase-applet-config.json for ease in AI Studio, 
// or use the standard VITE_ env if available.

import config from '../../firebase-applet-config.json';

export const firebaseConfig = config;
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  projectId: "mindfulyouth",
  appId: "1:394846150982:web:348b4c12f77ef85df18547",
  storageBucket: "mindfulyouth.firebasestorage.app",
  apiKey: "AIzaSyDVMA4C1q1HGmzr9DtCVIbbMnFNJgnZAhI",
  authDomain: "mindfulyouth.firebaseapp.com",
  messagingSenderId: "394846150982"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };

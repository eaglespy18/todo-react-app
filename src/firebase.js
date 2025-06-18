// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBayLADFjFEtJR-u5VUotoSq44JDLu_EvU",
  authDomain: "react-todo-auth-b4784.firebaseapp.com",
  projectId: "react-todo-auth-b4784",
  storageBucket: "react-todo-auth-b4784.firebasestorage.app",
  messagingSenderId: "594918741027",
  appId: "1:594918741027:web:8d3d208f96593c7f32cd96"
};

const app = initializeApp(firebaseConfig);

// ✅ Enable Firestore offline support
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache(),
});

export const auth = getAuth(app);
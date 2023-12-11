import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDsay0eJbHv-cfJU-J5thQfoHmClrxnJmM",
  authDomain: "test-875d8.firebaseapp.com",
  projectId: "test-875d8",
  storageBucket: "test-875d8.appspot.com",
  messagingSenderId: "230819283164",
  appId: "1:230819283164:web:e2ef3e93945fc3c0593419"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
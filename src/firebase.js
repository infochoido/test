import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { 
  getAuth,// authentication 설정
  signInWithPopup, //google 로그인을 팝업창에 띄우기 위해
  GoogleAuthProvider, //google login 기능
  signInWithEmailAndPassword,// email 로그인
  createUserWithEmailAndPassword, //email 회원가입
  onAuthStateChanged
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDsay0eJbHv-cfJU-J5thQfoHmClrxnJmM",
  authDomain: "test-875d8.firebaseapp.com",
  projectId: "test-875d8",
  storageBucket: "test-875d8.appspot.com",
  messagingSenderId: "230819283164",
  appId: "1:230819283164:web:e2ef3e93945fc3c0593419"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export const db = getFirestore(app);
export const firebaseDb = getFirestore(app);

export const signupEmail = (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const loginEmail = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const getUser = (callback) => {
  return onAuthStateChanged(auth, (user) => {
    callback(user);
  });
};



export { auth };
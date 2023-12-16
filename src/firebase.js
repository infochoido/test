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

import { doc, getDoc, } from 'firebase/firestore';
import { updateDoc } from 'firebase/firestore';
import { setDoc, serverTimestamp, collection, query, getDocs, where } from 'firebase/firestore';


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
  const authUser = onAuthStateChanged(auth, (user) => {
    if (typeof callback === 'function') {
      callback(user);
    }
  });

  return authUser;
};

export const updateAttendance = async (userEmail, currentDateTime) => {
  try {
    console.log(currentDateTime);
    // 'users' 컬렉션에 속한 사용자 문서를 가져옵니다.
    const usersCollectionRef = collection(db, 'users');
    const query1 = query(usersCollectionRef, where('email', '==', userEmail));
    const querySnapshot = await getDocs(query1);

    if (!querySnapshot.empty) {
      // 이메일이 일치하는 사용자 문서를 가져옵니다.
      const userDoc = querySnapshot.docs[0];
      const attendanceStatus = userDoc.data()?.attendance || {};

      // 오늘 날짜에 해당하는 출석 여부 확인
      if (attendanceStatus[currentDateTime]) {
        console.log('이미 출석 완료');
      } else {
        // 오늘 날짜에 해당하는 출석 여부가 없으면 출석 처리
        attendanceStatus[currentDateTime] = true;
        // 사용자 문서를 업데이트합니다.
        await updateDoc(userDoc.ref, { attendance: attendanceStatus });
        console.log('출석 완료');
      }
    } else {
      console.error('User document not found for email:', userEmail);
    }
  } catch (error) {
    console.error('Error updating attendance:', error.message);
  }
};



export const addCoinsOnAttendance = async (userEmail) => {
  try {
    // 'users' 컬렉션에 속한 사용자 문서를 가져옵니다.
    const usersCollectionRef = collection(db, 'users');
    const query1 = query(usersCollectionRef, where('email', '==', userEmail));
    const querySnapshot = await getDocs(query1);

    if (!querySnapshot.empty) {
      // 이메일이 일치하는 사용자 문서를 가져옵니다.
      const userDoc = querySnapshot.docs[0];
      const userCoins = userDoc.data()?.coins || 0;
      const updatedCoins = userCoins + 1000;
      // 사용자 문서를 업데이트합니다.
      await updateDoc(userDoc.ref, { coins: updatedCoins });
      alert('코인 추가 완료');
    } else {
      console.error('User document not found for email:', userEmail);
    }
  } catch (error) {
    console.error('Error adding coins on attendance:', error.message);
  }
};



export const addAttendanceStatus = async (userEmail, date) => {
  try {
    const usersCollectionRef = collection(db, 'users');
    const query1 = query(usersCollectionRef, where('email', '==', userEmail));
    const querySnapshot = await getDocs(query1);

    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      const attendanceData = userDoc.data()?.attendance || {};

      if (attendanceData[date]) {
        console.log('이미 출석 완료');
      } else {
        attendanceData[date] = true;
        await updateDoc(userDoc.ref, { attendance: attendanceData });
        console.log('출석 완료');
      }
    } else {
      console.error('User document not found for email:', userEmail);
    }
  } catch (error) {
    console.error('Error updating attendance:', error.message);
  }
};


export const getAttendanceStatus = async (userEmail, date) => {
  try {
    const usersCollectionRef = collection(db, 'users');
    const query1 = query(usersCollectionRef, where('email', '==', userEmail));
    const querySnapshot = await getDocs(query1);

    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      const attendanceData = userDoc.data()?.attendance || {};
      return attendanceData[date] || false;
    } else {
      console.error('User document not found for email:', userEmail);
      return false;
    }
  } catch (error) {
    console.error('Error getting attendance status:', error.message);
    return false;
  }
};



export { auth };
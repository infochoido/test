import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Input from '@mui/material/Input';
import Button from '@mui/material/Button';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

const ariaLabel = { 'aria-label': 'description' };

const firebaseConfig = {
  apiKey: "AIzaSyDsay0eJbHv-cfJU-J5thQfoHmClrxnJmM",
  authDomain: "test-875d8.firebaseapp.com",
  projectId: "test-875d8",
  storageBucket: "test-875d8.appspot.com",
  messagingSenderId: "230819283164",
  appId: "1:230819283164:web:e2ef3e93945fc3c0593419"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const testCollectionRef = collection(db, 'tests'); // 'tests'는 Firestore 컬렉션 이름입니다.

export default function MakeTest() {
  const [author, setauthor] = useState('');
  const [title, setTitle] = useState('');
  const [test, setTest] = useState('');
  const [answer, setAnswer] = useState('');
  const isButtonDisabled = !(author && title && test && answer);

  const handleAddTest = async () => {
    if (!isButtonDisabled) {
      try {
        const docRef = await addDoc(collection(db, 'tests'), {
          author: author,
          title: title,
          test: test,
          answer: answer,
        });
        alert('새로운 문제를 추가했습니다.');
      } catch (error) {
        console.error('문제 추가 실패:', error);
      }
    }
  };

  return (
    <div className='flex flex-col space-y-3'>
      <p className='text-2xl font-bold my-5'>문제 만들기</p>
      <Input
        placeholder="만든 이"
        inputProps={ariaLabel}
        value={author}
        onChange={(e) => setauthor(e.target.value)}
      />
      <Input
        placeholder="문제 제목"
        inputProps={ariaLabel}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <Input
        placeholder="문제 내용"
        inputProps={ariaLabel}
        value={test}
        onChange={(e) => setTest(e.target.value)}
      />
      <Input
        placeholder="정답"
        inputProps={ariaLabel}
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
      />
      <Button variant="contained" onClick={handleAddTest} disabled={isButtonDisabled}>
        입력
      </Button>
    </div>
  );
}

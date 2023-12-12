import React, { useState, useEffect, useRef } from 'react';
import { collection, addDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export default function Remarks() {
  const [words, setWords] = useState([]);
  const [currentWord, setCurrentWord] = useState('');
  const [error, setError] = useState('');
  const [isUserEntry, setIsUserEntry] = useState(false); // 추가된 단어가 사용자 입력 여부
  const maxListSize = 10; // 최대 리스트 크기 설정

  const listRef = useRef(null);

  // Fetch initial words from Firestore
  const fetchWordsFromFirestore = async () => {
    try {
      const wordsCollectionRef = collection(db, 'words');
      const querySnapshot = await getDocs(wordsCollectionRef);

      const wordsList = [];
      querySnapshot.forEach((doc) => {
        wordsList.push({ id: doc.id, word: doc.data().word });
      });

      setWords(wordsList);
    } catch (error) {
      console.error('단어 목록을 가져오는 도중 오류 발생:', error);
    }
  };

  useEffect(() => {
    fetchWordsFromFirestore();
  }, []);

  useEffect(() => {
    // 사용자가 입력한 단어일 경우 로컬 스토리지에 마지막 입력 정보 저장
    if (isUserEntry) {
      localStorage.setItem('lastUserEntry', JSON.stringify(words));
      setIsUserEntry(false);
    }
  }, [words, isUserEntry]);

  // 로컬 스토리지에서 저장된 사용자 입력 정보 로드
  useEffect(() => {
    const lastUserEntry = localStorage.getItem('lastUserEntry');
    if (lastUserEntry) {
      setWords(JSON.parse(lastUserEntry));
    }
  }, []);

  const handleWordChange = (event) => {
    setCurrentWord(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (validateWord()) {
      try {
        const isValid = await checkWordValidity(currentWord);
        if (isValid) {
          await addWordToFirestore(currentWord);
          setError('');
          setIsUserEntry(true);
        } else {
          setError('사전에 존재하지 않는 단어입니다.');
        }
      } catch (error) {
        console.error('Firestore에 단어 추가 실패:', error);
        setError('단어를 추가하는 도중 오류가 발생했습니다.');
      }
    } else {
      setError('끝말잇기 규칙에 어긋납니다.');
    }
  };

  const validateWord = () => {
    if (currentWord.length === 1) {
      return false; // 한 글자 단어는 규칙에 어긋남
    }

    if (words.length === 0) {
      return true; // 첫 단어는 규칙 검사 없이 허용
    }

    const lastWord = words[words.length - 1].word;
    const lastWordEnd = lastWord.charAt(lastWord.length - 1);
    const currentWordStart = currentWord.charAt(0);

    return lastWordEnd === currentWordStart;
  };

  const checkWordValidity = async (word) => {
    // Simulating word validation, you can replace this with your actual word validation logic
    return word.length > 0;
  };

  const addWordToFirestore = async (word) => {
    try {
      const wordsCollectionRef = collection(db, 'words');
      const docRef = await addDoc(wordsCollectionRef, { word });

      const updatedWords = [...words, { id: docRef.id, word }];
      setWords(updatedWords);
      setCurrentWord('');

      // 스크롤을 항상 최하단으로 이동
      if (listRef.current) {
        listRef.current.scrollTop = listRef.current.scrollHeight;
      }
    } catch (error) {
      console.error('Firestore에 단어 추가 실패:', error);
    }
  };

  const handleDeleteWord = async (id) => {
    try {
      const wordsCollectionRef = collection(db, 'words');
      await deleteDoc(doc(wordsCollectionRef, id));

      const updatedWords = words.filter((word) => word.id !== id);
      setWords(updatedWords);
    } catch (error) {
      console.error('Firestore에서 단어 삭제 실패:', error);
    }
  };

  return (
    <div>
      <h2 className='my-3 text-2xl'>끝말잇기 게임</h2>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div ref={listRef} style={{ maxHeight: '450px', overflowY: 'auto' }}>
        <h3>입력된 단어들:</h3>
        <ul className='list-none'>
            {words.map((word, index) => (
                <li
                key={word.id}
                className={`my-2${index === words.length - 1 ? ' submitted-word' : ''} border-spacing-2 border-2 rounded-lg p-2 ${
                    index === words.length - 1 ? 'text-right font-black' : ''} ${index !== words.length - 1 ? '' : 'text-green-600'}`}
                >
                {word.word}
                <button onClick={() => handleDeleteWord(word.id)} className='ml-5 text-xs rounded '>
                    삭제
                </button>
                </li>
            ))}
            </ul>
      </div>
      <form onSubmit={handleSubmit}>
        <label>
          단어 입력:
          <input type="text" className='p-1 border' value={currentWord} onChange={handleWordChange} />
        </label>
        <button type="submit">입력</button>
      </form>
    </div>
  );
}

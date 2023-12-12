import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export default function Remarks() {
  const [words, setWords] = useState([]);
  const [currentWord, setCurrentWord] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWordsFromFirestore();
  }, []);

  const fetchWordsFromFirestore = async () => {
    const wordsCollectionRef = collection(db, 'words');
    const querySnapshot = await getDocs(wordsCollectionRef);

    const wordsList = [];
    querySnapshot.forEach((doc) => {
      wordsList.push(doc.data().word);
    });

    setWords(wordsList);
  };

  const handleWordChange = (event) => {
    setCurrentWord(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (validateWord()) {
      try {
        await addWordToFirestore(currentWord);
        setError('');
      } catch (error) {
        console.error('Firestore에 단어 추가 실패:', error);
        setError('단어를 추가하는 도중 오류가 발생했습니다.');
      }
    } else {
      setError('끝말잇기 규칙에 어긋납니다.');
    }
  };

  const validateWord = () => {
    if (words.length === 0) {
      return true; // 첫 단어는 규칙 검사 없이 허용
    }

    const lastWord = words[words.length - 1];
    const lastWordEnd = lastWord.charAt(lastWord.length - 1);
    const currentWordStart = currentWord.charAt(0);

    return lastWordEnd === currentWordStart;
  };

  const addWordToFirestore = async (word) => {
    const wordsCollectionRef = collection(db, 'words');
    await addDoc(wordsCollectionRef, { word });

    const updatedWords = [...words, word];
    setWords(updatedWords);
    setCurrentWord('');
  };

  return (
    <div>
      <h2 className='my-3 text-2xl'>끝말잇기 게임</h2>
      <form onSubmit={handleSubmit}>
        <label>
          단어 입력:
          <input type="text" className='p-1 border' value={currentWord} onChange={handleWordChange} />
        </label>
        <button type="submit">입력</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div>
        <h3>입력된 단어들:</h3>
        <ul>
          {words.map((word, index) => (
            <li key={index} style={{ fontWeight: index === words.length - 1 ? 'bold' : 'normal' }} className='my-2'>
              {word}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

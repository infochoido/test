import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

const apiKey = "7CF89799250AC03AE28B48673E096DA4";

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
      wordsList.push({ id: doc.id, word: doc.data().word });
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
        const isValid = await checkWordValidity(currentWord);
        if (isValid) {
          await addWordToFirestore(currentWord);
          setError('');
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
    if (words.length === 0) {
      return true; // 첫 단어는 규칙 검사 없이 허용
    }

    const lastWord = words[words.length - 1].word;
    const lastWordEnd = lastWord.charAt(lastWord.length - 1);
    const currentWordStart = currentWord.charAt(0);

    return lastWordEnd === currentWordStart;
  };

  const checkWordValidity = async (word) => {
    const response = await fetch(`https://opendict.korean.go.kr/api/search?key=${apiKey}&q=${word}&advanced=y&method=exact`);
    const data = await response.text();
    
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(data, "text/xml");
    const totalNodes = xmlDoc.getElementsByTagName("total")[0].childNodes[0].nodeValue;

    return totalNodes > 0;
  };

  const addWordToFirestore = async (word) => {
    const wordsCollectionRef = collection(db, 'words');
    const docRef = await addDoc(wordsCollectionRef, { word });

    const updatedWords = [...words, { id: docRef.id, word }];
    setWords(updatedWords);
    setCurrentWord('');
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
          {words.map((word) => (
            <li key={word.id} className='my-2'>
              {word.word}
              <button onClick={() => handleDeleteWord(word.id)} className='ml-5 rounded '>
                삭제
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

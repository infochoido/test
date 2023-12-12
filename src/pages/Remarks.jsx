import React, { useState, useEffect } from 'react';

export default function Remarks() {
  const [words, setWords] = useState([]);
  const [currentWord, setCurrentWord] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWordsFromFirestore();
  }, []);

  const fetchWordsFromFirestore = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/words'); // 서버 주소에 맞게 변경
      const data = await response.json();
      setWords(data);
    } catch (error) {
      console.error('단어 목록을 가져오는 도중 오류 발생:', error);
    }
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
    try {
      const response = await fetch(`http://localhost:3001/api/words/check-validity?word=${word}`); // 서버 주소에 맞게 변경
      const data = await response.json();
      return data.isValid;
    } catch (error) {
      console.error('단어 유효성 확인 오류:', error);
      throw new Error('단어 유효성 확인 오류');
    }
  };

  const addWordToFirestore = async (word) => {
    try {
      const response = await fetch('http://localhost:3001/api/words', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ word }),
      }); // 서버 주소에 맞게 변경
      const data = await response.json();
      setWords((prevWords) => [...prevWords, data]);
      setCurrentWord('');
    } catch (error) {
      console.error('단어를 Firestore에 추가하는 도중 오류 발생:', error);
    }
  };

  const handleDeleteWord = async (id) => {
    try {
      await fetch(`http://localhost:3001/api/words/${id}`, {
        method: 'DELETE',
      }); // 서버 주소에 맞게 변경
      setWords((prevWords) => prevWords.filter((word) => word.id !== id));
    } catch (error) {
      console.error('단어를 Firestore에서 삭제하는 도중 오류 발생:', error);
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

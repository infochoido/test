import React, { useState } from 'react';
import Button from '@mui/material/Button';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';


export default function MakeTest() {
  const [author, setauthor] = useState('');
  const [title, setTitle] = useState('');
  const [test, setTest] = useState('');
  const [password, setPassword] = useState('');
  const isButtonDisabled = !(author && title && test && password);
  const navigate = useNavigate();

  const handleAddTest = async () => {
    if (!isButtonDisabled) {
      try {
        const docRef = await addDoc(collection(db, 'tests'), {
          author: author,
          password: password,
          title: title,
          test: test,
          created_at: serverTimestamp(),
        });

        const newDocId = docRef.id;
        alert('글 작성완료');
        navigate(`/post/${newDocId}`);
      } catch (error) {
        console.error('글 작성 실패:', error);
      }
    }
  };

  return (
    <div className='flex flex-col space-y-3'>
      <table>
        <tr>
          <th colSpan="2">
            글쓰기
          </th>
        </tr>
        <tr>
            <td width="50">
                <select>
                    <option>자유게시판</option>
                    <option>속보</option>
                    <option>우정서</option>
                </select>
            </td>
            <td >
                <input type="text" placeholder="제목을 입력하세요."
                className='w-full p-2 my-2 border-2'
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                 />
            </td>
        </tr>
        <tr>
          <td>
            <input type="text" placeholder="작성자"
              className='w-full max-w-xl p-1 my-2 border-2'
              value={author}
              onChange={(e) => setauthor(e.target.value)}
            />
          </td>
          <td >
            <input placeholder="비밀번호"
              type="password"
              className='w-full max-w-xl p-1 my-2 border-2'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </td>
        </tr>
        <tr className='my-2'>
          <td colSpan="2" className='h-[300px]'>
            <textarea placeholder='내용을 입력하세요.' className='w-full h-full p-2 my-3 border-2 rounded-xl ' value={test} onChange={(e) => setTest(e.target.value)}></textarea>
          </td>
        </tr>
      </table>
      <button variant="contained" className={`m-auto sm:w-10 md:w-20 p-2 rounded-lg text-white ${isButtonDisabled ? "bg-slate-300" : "shadow-2xl bg-slate-500"} `} onClick={handleAddTest} disabled={isButtonDisabled}>
        글쓰기
      </button>
    </div>
  );
}

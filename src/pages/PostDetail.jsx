import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';

export default function PostDetail() {
  const { postId } = useParams();
  const [postData, setPostData] = useState(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordCorrect, setPasswordCorrect] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPostData = async () => {
      try {
        const docRef = doc(db, 'tests', postId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setPostData(docSnap.data());
        } else {
          console.log('문서가 없습니다');
        }
      } catch (error) {
        console.error('Error fetching document:', error);
      }
    };

    fetchPostData();
  }, [postId]);

  const handleDeletePost = async () => {
    try {
      if (passwordCorrect) {
        const docRef = doc(db, 'tests', postId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const storedPassword = docSnap.data().password;

          if (storedPassword === passwordInput) {
            await deleteDoc(docRef);
            alert('글이 삭제되었습니다.');
            navigate('/');
          } else {
            alert('비밀번호가 올바르지 않습니다.');
          }
        }
      } else {
        alert('비밀번호가 올바르지 않습니다.');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordInput(e.target.value);
  };

  const formatDateTime = (date) => {
    if (date && date.toISOString) {
      const options = { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: false };
      const formattedDate = new Intl.DateTimeFormat('ko-KR', options).format(date);
      const [year, month, day, time] = formattedDate.split(' ');
      const [hour, minute] = time.split(':');
      return `${year}${month}${day} ${hour}:${minute}`;
    } else {
      return '유효하지 않은 날짜';
    }
  };

  return (
    <div>
      {postData ? (
        <>
          <table>
            <thead>
              <tr className='flex flex-col'>
                <td className='text-2xl font-bold'>{postData.title}</td>
                <td>작성자 : {postData.author}</td>
                <td>작성날짜 : {formatDateTime(postData.created_at.toDate())}</td>
                <td className='w-full p-5 m-2 border-2 rounded-xl'>{postData.test}</td>
              </tr>
            </thead>
          </table>
          <div>
            <label>
              비밀번호 입력:
              <input
                type="password"
                value={passwordInput}
                onChange={handlePasswordChange}
                className='m-1 border-2'
              />
            </label>
          </div>
          <button onClick={handleDeletePost} className='px-2 text-white bg-slate-600'>
            글 삭제
          </button>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

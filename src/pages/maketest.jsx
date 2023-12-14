import React, { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { db } from '../firebase';

export default function MakeTest() {
  const [author, setAuthor] = useState('');
  const [title, setTitle] = useState('');
  const [test, setTest] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [image, setImage] = useState(null);
  const [imageFileName, setImageFileName] = useState('');
  const [downloadedUrl, setDownloadedUrl] = useState('');
  const [email, setEmail] = useState('');

  const auth = getAuth();
  const isButtonDisabled = !(title && test && (auth.currentUser ? true : password));

  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setAuthor(currentUser.nickname);
      setNickname(currentUser.nickname);

      const getUserInfo = async () => {
        try {
          const q = query(collection(db, 'users'), where("email", "==", currentUser.email));
          const querySnapshot = await getDocs(q);
      
          if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data();
            setNickname(userData.nickname);
            setEmail(currentUser.email); // Set the email
          } else {
            console.error("해당 이메일을 가진 사용자가 없습니다.");
          }
        } catch (error) {
          console.error("사용자 정보 가져오기 중 오류가 발생했습니다:", error.message);
        }
      };

      getUserInfo();
    }
  }, [auth.currentUser]);

  const handleImageUpload = async () => {
    try {
      if (image) {
        console.log('Image selected:', image);
        const fileName = image.name;
        setImageFileName(fileName);
  
        const storage = getStorage();
        const storageRef = ref(storage, `test_images/${fileName}`);
        await uploadBytes(storageRef, image);
        const downloadUrl = await getDownloadURL(storageRef);
  
        console.log('Download URL:', downloadUrl);
        return downloadUrl; // downloadUrl을 리턴
      }
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      alert('이미지 업로드 실패');
      return null;
    }
  };

  const getUserInfoByEmail = async (userEmail) => {
    try {
      const q = query(collection(db, 'users'), where("email", "==", userEmail));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        return {
          name: userData.name,
          nickname: userData.nickname,
          email: userEmail,
        };
      } else {
        console.error("해당 이메일을 가진 사용자가 없습니다.");
        return null;
      }
    } catch (error) {
      console.error("사용자 정보 가져오기 중 오류가 발생했습니다:", error.message);
      return null;
    }
  };

  const handleAddTest = async () => {
    if (!isButtonDisabled) {
      try {
        console.log('Image File Name:', imageFileName);
        await handleImageUpload();
  
        const currentUser = auth.currentUser;
        const authorInfo = currentUser ? currentUser.nickname : author;
        const userEmail = currentUser ? currentUser.email : '';
        const userInfo = await getUserInfoByEmail(userEmail);
        console.log(downloadedUrl); // You should see the URL logged here
  
        const firestore = getFirestore();
        const docRef = await addDoc(collection(firestore, 'tests'), {
          author: userInfo ? userInfo.nickname : authorInfo,
          password: password,
          email: userEmail,
          title: title,
          test: test,
          logined: !!userInfo,
          imageUrl: downloadedUrl, // Using the downloadedUrl state
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

  const handleDefaultAuthor = () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setAuthor(currentUser.nickname);
    }
  };
  return (
    <div className='flex flex-col mt-3 mb-20 space-y-3'>
      <table>
        <tr>
          <th colSpan="2">
            글쓰기
          </th>
        </tr>
        <tr>
          <td className='flex flex-col'>
            <td width="50">
              <select>
                <option>자유게시판</option>
                <option>속보</option>
                <option>우정서</option>
              </select>
            </td>
          </td>
        </tr>
        <tr>
          <td>
            <input
              type="text"
              placeholder="제목을 입력하세요."
              className='w-full p-2 my-2 border-2'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </td>
        </tr>
        <tr>
       
        {auth.currentUser ? 
         <td>
        <label className="w-full max-w-xl p-1 my-2">{nickname}</label>
        </td>: (
          <tr>
           <td>
           <input
               type="text"
               placeholder="작성자"
               className={`w-full max-w-xl p-1 my-2 ${auth.currentUser ? 'border-none' : 'border-2'}`}
               value={author}
               onChange={(e) => setAuthor(e.target.value)}
               readOnly={auth.currentUser !== null}
               onClick={handleDefaultAuthor}
             />
           </td>
            <td>
              <input
                placeholder="비밀번호"
                type="password"
                className='w-full max-w-xl p-1 my-2 border-2'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </td>
            </tr>
          )}
        </tr>
        <tr className='my-4'>
          <td className='h-12'>
            <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
          </td>
        </tr>
        <div className='w-full h-[300px] p-2 my-3 border-2 rounded-xl overflow-auto'>
          <tr className='my-4'>
            <td colSpan="2">
              <textarea
                placeholder='내용을 입력하세요.'
                className='w-full h-full resize-none'
                value={test}
                onChange={(e) => setTest(e.target.value)}
              />
            </td>
          </tr>
          <tr className='my-4'>
            <td colSpan="2">
              {image && (
                <div style={{ width: '30%', overflow: 'hidden' }}>
                  <img
                    src={URL.createObjectURL(image)}
                    alt="Uploaded"
                    style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
                  />
                </div>
              )}
            </td>
          </tr>
        </div>
      </table>
      <button
  variant="contained"
  className={`m-auto mb-40 sm:w-10 md:w-20 p-2 rounded-lg text-white ${
    isButtonDisabled ? 'bg-slate-300' : 'shadow-2xl bg-slate-500'
  } `}
  onClick={handleAddTest}
  disabled={isButtonDisabled}
>
  글쓰기
</button>
    </div>
  );
}

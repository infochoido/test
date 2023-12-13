import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import {
  doc,
  getDoc,
  deleteDoc,
  addDoc,
  collection,
  serverTimestamp,
  query,
  where,
  getDocs,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { auth } from '../firebase';
import { userProfileState } from '../recoilAtom';
import { useRecoilState } from 'recoil';
import { updateDoc } from 'firebase/firestore';

export const CommentForm = ({ postId }) => {
  const [content, setContent] = useState('');
  const [userProfilePicture, setUserProfilePicture] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');

  const [userProfile, setUserProfile] = useRecoilState(userProfileState);

  useEffect(() => {
    const user = auth.currentUser;

    if (user) {
      setUserProfile({
        displayName: user.displayName,
        photoURL: user.photoURL,
      });
    }
  }, [setUserProfile]);

  useEffect(() => {
    if (userProfile) {
      setUserProfilePicture(userProfile.photoURL);
      setNickname(userProfile.displayName);
    }
  }, [userProfile]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    try {
      const commentsCollectionRef = collection(db, 'comments');
      const user = auth.currentUser;

      if (user) {
        await addDoc(commentsCollectionRef, {
          content,
          author: user.displayName,
          postId,
          createdAt: serverTimestamp(),
          authorProfilePicture: user.photoURL,
        });

        setContent('');
      } else {
        // When user is not logged in, include password and nickname fields
        await addDoc(commentsCollectionRef, {
          content,
          author: nickname,
          postId,
          createdAt: serverTimestamp(),
          password,
        });

        setContent('');
        setPassword('');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  return (
    <form onSubmit={handleCommentSubmit} className='flex flex-wrap p-1 m-3 space-y-2 border-2 md:space-y-0 md:space-x-1'>
      <div className='mb-2 flex-1/2'>
        {userProfile && (
          <label className='block text-xs'>닉네임: {userProfile.displayName}</label>
        )}
        {userProfilePicture && userProfile && (
          <img
            src={userProfilePicture}
            alt='프로필'
            style={{ width: '20px', height: '20px', borderRadius: '50%', marginLeft: '8px' }}
          />
        )}
      </div>
      {!userProfile && ( // Show password and nickname input only when user is not logged in
        <>
          <div className='mb-2 flex-1/2'>
            <label className='block text-xs'>닉네임:</label>
            <input
              className='w-full py-1 text-xs border-2 md:text-sm'
              type='text'
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
          </div>
          <div className='mb-2 flex-1/2'>
            <label className='block text-xs'>비밀번호:</label>
            <input
              className='w-full py-1 text-xs border-2 md:text-sm'
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </>
      )}
      <div className='flex items-center w-full mb-2'>
        <label className='block w-10 text-xs'>댓글:</label>
        <input
          className='w-full py-1 text-xs border-2 md:text-sm'
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button type='submit' className='w-20 p-1 text-xs text-white md:text-sm rounded-md m-2 bg-[#004C2F]'>
          댓글
        </button>
      </div>
    </form>
  );
};


const CommentList = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [commentPasswords, setCommentPasswords] = useState({});
  const [userProfilePictures, setUserProfilePictures] = useState({});
  const [currentUserNickname, setCurrentUserNickname] = useState('');

  const [userProfile] = useRecoilState(userProfileState);

  const fetchComments = async () => {
    try {
      const commentsQuery = query(collection(db, 'comments'), where('postId', '==', postId), orderBy('createdAt', 'asc'));
      const querySnapshot = await getDocs(commentsQuery);

      const commentsData = [];
      querySnapshot.forEach((doc) => {
        commentsData.push({ id: doc.id, ...doc.data() });
      });

      setComments(commentsData);
    } catch (error) {
      console.error('댓글을 불러오는 중 오류 발생:', error);
    }
  };

  const setupCommentsListener = () => {
    const commentsCollectionRef = collection(db, 'comments');
    const commentsQuery = query(commentsCollectionRef, where('postId', '==', postId), orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
      const commentsData = [];
      const profilePictures = {};

      snapshot.forEach((doc) => {
        const commentData = { id: doc.id, ...doc.data() };
        commentsData.push(commentData);

        if (commentData.author && commentData.authorProfilePicture) {
          profilePictures[commentData.author] = commentData.authorProfilePicture;
        }
      });

      setComments(commentsData);
      setUserProfilePictures(profilePictures);
    });

    return unsubscribe;
  };

  const fetchCurrentUserNickname = () => {
    const user = auth.currentUser;
    if (user) {
      setCurrentUserNickname(user.displayName);
    }
  };

  useEffect(() => {
    fetchComments();
    const unsubscribe = setupCommentsListener();
    fetchCurrentUserNickname();
    return () => unsubscribe();
  }, [postId]);

  const handleCommentDelete = async (commentId) => {
    const password = commentPasswords[commentId];

    try {
      const commentRef = doc(db, 'comments', commentId);
      const commentSnap = await getDoc(commentRef);

      if (commentSnap.exists()) {
        const storedPassword = commentSnap.data().password;

        if (storedPassword === password) {
          await deleteDoc(commentRef);
          console.log('댓글이 삭제되었습니다.');
          alert('댓글이 삭제되었습니다');
          fetchComments();
        } else {
          console.log('비밀번호가 올바르지 않습니다.');
          alert('비밀번호가 올바르지 않습니다');
        }
      }
    } catch (error) {
      console.error('댓글 삭제 중 오류 발생:', error);
    }
  };

  const handlePasswordChange = (e, commentId) => {
    const newPasswords = { ...commentPasswords, [commentId]: e.target.value };
    setCommentPasswords(newPasswords);
  };

  return (
    <div className='my-5'>
      <h2>댓글목록</h2>
      {comments.map((comment) => (
        <div key={comment.id} className='p-2 m-3 border-2'>
          <p>{comment.content}</p>
          <div className='flex flex-col justify-between'>
            <div className='flex items-center'>
              {comment.author && userProfilePictures[comment.author] && (
                <img
                  src={userProfilePictures[comment.author]}
                  alt='프로필'
                  style={{ width: '20px', height: '20px', borderRadius: '50%', marginRight: '8px' }}
                />
              )}
              <p className='text-xs'>작성자: {comment.author}</p>
            </div>
            <div className='flex items-center'>
              <label className='text-xs'>
                비밀번호:
                <input className='border-2' type='password' onChange={(e) => handlePasswordChange(e, comment.id)} />
              </label>
              <button className='p-1 text-xs text-white rounded-md bg-[#004C2F]' onClick={() => handleCommentDelete(comment.id)}>
                댓글 삭제
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const PostDetail = () => {
  const { postId } = useParams();
  const [postData, setPostData] = useState(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordCorrect, setPasswordCorrect] = useState(true);
  const [imageUrl, setImageUrl] = useState('');
  const storage = getStorage();
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [editedPost, setEditedPost] = useState('');
  const [editedComment, setEditedComment] = useState('');
  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [userProfile] = useRecoilState(userProfileState);

  const handleEditPost = () => {
    setEditMode(true);
    setEditedPost(postData.test);
    setEditedTitle(postData.title);
    setEditedContent(postData.test);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditedPost('');
  };

  const handleSavePost = async () => {
    try {
      const docRef = doc(db, 'tests', postId);
      await updateDoc(docRef, { title: editedTitle, test: editedContent });
      setEditMode(false);
      alert('글이 수정되었습니다.');
      // Fetch the updated data after saving
      const updatedDocSnap = await getDoc(docRef);
      setPostData(updatedDocSnap.data());
    } catch (error) {
      console.error('Error updating document:', error);
    }
  };

  useEffect(() => {
    const fetchPostData = async () => {
      try {
        const docRef = doc(db, 'tests', postId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setPostData(docSnap.data());

          if (docSnap.data().imageUrl) {
            setImageUrl(docSnap.data().imageUrl);
          }
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
    <div className='mt-5'>
      {postData ? (
        <div>
          <table className='w-full'>
            <thead>
              <tr className='flex flex-col w-full'>
                <td className='flex items-center'>
                  <p className='text-sm font-normal text-gray-400'>제목 :</p>
                  {editMode ? (
                    <input
                      type='text'
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      className='border-2'
                    />
                  ) : (
                    postData.title
                  )}
                </td>
                <div className='flex space-x-3'>
                  <td className='flex items-center'>
                    <p className='text-sm font-normal text-gray-400'>작성자 :</p> {postData.author}
                  </td>
                  <td className='flex items-center'>
                    <p className='text-sm font-normal text-gray-400'>작성날짜 :</p>{' '}
                    {formatDateTime(postData.created_at.toDate())}
                  </td>
                </div>
                <td className='w-full p-4 my-5 border-2 min-h-[200px] rounded-xl'>
                  {editMode ? (
                    <textarea
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      className='w-full border-2'
                    />
                  ) : (
                    postData.test
                  )}
                  {imageUrl && (
                    <div className='my-5'>
                      <img
                        src={imageUrl}
                        alt='Uploaded'
                        style={{ maxWidth: '40%', height: 'auto', objectFit: 'contain' }}
                      />
                    </div>
                  )}
                </td>
              </tr>
            </thead>
          </table>
          <div className='flex'>
  {editMode && (
    <>
      <button
        onClick={handleCancelEdit}
        className='w-20 px-1 mx-3 text-sm bg-white shadow-sm rounded-xl sm:w-20 sm:text-xs shadow-black'>
        취소
      </button>
      <button
        onClick={handleSavePost}
        className='w-20 px-1 mx-3 text-sm bg-white shadow-sm rounded-xl sm:w-20 sm:text-xs shadow-black'>
        저장
      </button>
    </>
  )}
  {!editMode && (
    <>
      {(userProfile && userProfile.email === postData.email) || postData.logined ? (
        <>
          <button
            onClick={handleEditPost}
            className='w-20 px-1 mx-3 text-sm bg-white shadow-sm rounded-xl sm:w-20 sm:text-xs shadow-black'>
            수정
          </button>
          <button
            onClick={handleDeletePost}
            className='w-20 px-1 mx-3 text-sm bg-white shadow-sm rounded-xl sm:w-20 sm:text-xs shadow-black'>
            글 삭제
          </button>
        </>
      ) : (
        <>
          <label className='text-sm'>
            비밀번호 입력:
            <input
              type='password'
              value={passwordInput}
              onChange={handlePasswordChange}
              className='m-1 border-2'
            />
          </label>
          <button
            onClick={handleDeletePost}
            className='w-20 px-1 mx-3 text-sm bg-white shadow-sm rounded-xl sm:w-20 sm:text-xs shadow-black'>
            글 삭제
          </button>
        </>
      )}
    </>
  )}
</div>

          <div className='flex'>
            {!editMode && (
              <div className='my-10'>
                <p>댓글쓰기</p>
                <CommentForm postId={postId} />
              </div>
            )}
          </div>
          <div className='my-10'>
            <CommentList postId={postId} />
          </div>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
  
  
  
};

export default PostDetail;

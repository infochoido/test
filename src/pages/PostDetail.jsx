import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
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
import { connectStorageEmulator, getStorage } from 'firebase/storage';
import { userProfileState } from '../recoilAtom';
import { useRecoilState, useRecoilValue } from 'recoil';
import { updateDoc } from 'firebase/firestore';
import { getUser } from '../firebase';
import { getAuth } from 'firebase/auth';


export const CommentForm = ({ postId }) => {
  const [content, setContent] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');

  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = getUser((userData) => {
      console.log("User data from getUser:", userData);
      setUser(userData && userData.email ? userData : null);
    });

    return () => unsubscribe();
  }, []);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    try {
      const commentsCollectionRef = collection(db, 'comments');
      const user = auth.currentUser;
      console.log('user 저장', user)

      if (user) {
        await addDoc(commentsCollectionRef, {
          content,
          author: user.displayName,
          postId,
          createdAt: serverTimestamp(),
          //authorProfilePicture: user.profilePicture,
          uid: user.uid,
          email: user.email
        });

        setContent('');
      } else {
        // When the user is not logged in, include password and nickname fields
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
    <form onSubmit={handleCommentSubmit} className='flex flex-wrap w-full p-1 m-3 space-y-2 border-2 md:space-y-0 md:space-x-1'>
      <div className='w-full mb-2 flex-1/2'>
        {user && (
          <label className='block text-xs'>닉네임: {user.displayName}</label>
        )}
        {!user && ( 
          <div className='flex space-x-2'>
            <div className='mb-2 flex-1/2'>
              <label className='block text-xs'>닉네임:</label>
              <input
                className='w-full px-1 text-xs border-2 md:text-sm'
                type='text'
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
            </div>
            <div className='mb-2 flex-1/2'>
              <label className='block text-xs'>비밀번호:</label>
              <input
                className='w-full px-1 text-xs border-2 md:text-sm'
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
        )}
      <div className='flex items-center w-full'>
        <label className='block w-10 text-xs'>댓글:</label>
        <input
          className='w-full p-1 text-xs border-2 md:text-sm'
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button type='submit' className='w-20 p-1 text-xs text-white md:text-sm rounded-md m-2 bg-[#004C2F]'>
          댓글
        </button>
      </div>
      </div>
    </form>
  );
}

export const CommentList = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [commentPasswords, setCommentPasswords] = useState({});
  const [userProfilePictures, setUserProfilePictures] = useState({});
  const [currentUserNickname, setCurrentUserNickname] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = getUser((userData) => {
      console.log("User data from getUser:", userData);
      setUser(userData && userData.email ? userData : null);
    });

    return () => unsubscribe();
  }, []);


  const fetchComments = async () => {
    try {
      const commentsQuery = query(collection(db, 'comments'), where('postId', '==', postId), orderBy('createdAt', 'asc'));
      const querySnapshot = await getDocs(commentsQuery);

      const commentsData = [];

      querySnapshot.forEach((doc) => {
        const commentData = { id: doc.id, ...doc.data() };
        commentsData.push(commentData);

        if (commentData.email) {
          fetchUserData(commentData.email); // Pass the user's email to fetchUserData
        }
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
      const profilePictures = { ...userProfilePictures };

      snapshot.forEach((doc) => {
        const commentData = { id: doc.id, ...doc.data() };
        commentsData.push(commentData);

        if (commentData.email) {
          fetchUserProfile(commentData.email); // Fetch user profile when not already fetched
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
      setCurrentUserNickname(user.nickname);
    }
  };

  const fetchUserProfile = async (email) => {
    try {
      const usersCollectionRef = collection(db, 'users');
      const usersQuery = query(usersCollectionRef, where('email', '==', email));
      const usersSnapshot = await getDocs(usersQuery);
  
      if (!usersSnapshot.empty) {
        const userDoc = usersSnapshot.docs[0];
        const userData = userDoc.data();
        setUserProfilePictures((prev) => ({ ...prev, [userData.email]: userData.photoURL }));
      }
    } catch (error) {
      console.error(`Error fetching user profile for email ${email}:`, error);
    }
  };

  const fetchUserData = async (email) => {
    try {
      const usersCollectionRef = collection(db, 'users');
      const usersQuery = query(usersCollectionRef, where('email', '==', email));
      const usersSnapshot = await getDocs(usersQuery);

      if (!usersSnapshot.empty) {
        const userDoc = usersSnapshot.docs[0];
        const userData = userDoc.data();
        fetchUserProfile(userData.uid); // Fetch user profile based on UID
      }
    } catch (error) {
      console.error(`Error fetching user data for email ${email}:`, error);
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
          alert('댓글이 삭제되었습니다');
          // No need to fetch comments again here; it will be updated through the snapshot listener
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
    <div className='my-2 mb-40 '>
      <h2>댓글목록</h2>
      {comments.map((comment) => (
        <div key={comment.id} className='flex p-2 m-3 border-2'>
          <div className='flex items-center'>
              {comment.email && userProfilePictures[comment.email] && (
                <img
                  src={userProfilePictures[comment.email]}
                  alt='프로필'
                  style={{borderRadius: '50%', marginRight: '8px' }}
                  className='w-10 h-10'
                />
              )}

              <div className='flex flex-col'>
              <p className='text-xs'>작성자: {comment.author}</p>
              <p>{comment.content}</p>
              </div>
            
          </div>
          <div className='flex flex-col justify-between'>
            
            
          {
  /* 아래 부분 수정 */
  (user && comment.email === user.email) ? (
    <div className='flex items-center ml-8'>
      <button className='text-xs text-gray-400 rounded-md ' onClick={() => handleCommentDelete(comment.id)}>
        댓글 삭제
      </button>
    </div>
  ) : (
    (!user && !comment.email) ? (
      <div className='flex items-center ml-10'>
        <label className='text-xs'>
          비밀번호:
          <input className='border-2' type='password' onChange={(e) => handlePasswordChange(e, comment.id)} />
        </label>
        <button className='p-1 text-xs text-gray-400 rounded-md ' onClick={() => handleCommentDelete(comment.id)}>
          댓글 삭제
        </button>
      </div>
    ) : null
  )
}
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
  const [imageUrl, setImageUrl] = useState('');
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [userProfile, setUserProfile] = useRecoilState(userProfileState);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = getUser((userData) => {
      console.log("User data from getUser:", userData);
      setUser(userData && userData.email ? userData : null);
    });

    return () => unsubscribe();
  }, []);

  

  const handleEditPost = () => {
    // 사용자가 로그인했고, 프로필 정보와 포스트 정보가 존재하며, 이메일이 일치하거나 비밀번호가 맞다면
    if (
      (postData.logined && userProfile && userProfile.email === postData.email) ||
      (!postData.logined && passwordInput === postData.password)
    ) {
      // 수정 모드로 전환
      setEditMode(true);
      // 기존 제목과 내용을 상태에 저장
      setEditedTitle(postData.title);
      setEditedContent(postData.test);
    } else {
      // 권한이 없을 경우 사용자에게 알림
      alert('비밀번호가 올바르지 않습니다');
    }
  };

  useEffect(() => {
    if (userProfile && postData) {
      console.log(userProfile);
      console.log(postData);
    }
  }, [userProfile, postData]);

  const handleCancelEdit = () => {
    setEditMode(false);
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
      const docRef = doc(db, 'tests', postId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const storedPassword = docSnap.data().password;

        if (postData.logined && user && user.email) {
          // If logined and user is the owner, no need for password
          await deleteDoc(docRef);
          alert('글이 삭제되었습니다.');
          navigate('/');
        } else if (storedPassword === passwordInput) {
          await deleteDoc(docRef);
          alert('글이 삭제되었습니다.');
          navigate('/');
        } else {
          alert('비밀번호가 올바르지 않습니다.');
        }
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

  // useEffect(() => {
  //   const unsubscribe = auth.onAuthStateChanged((user) => {
  //     if (user) {
  //       setUserProfile({
  //         nickname: userProfile.nickname,
  //         name : userProfile.name,
  //         photoURL: userProfile.profilePicture,
  //         email: user.email,
  //         // Add other relevant user information
  //       });
  //       console.log("유저", userProfile)
  //     } else {
  //       setUserProfile(null);
  //     }
  //   });

  //   return () => unsubscribe();
  // }, [setUserProfile]);

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
                    postData && postData.test
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
          <div className='flex items-center'>
            {!editMode && (
              <>
                {postData.logined && user && user.email === postData.email ? (
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
                ) : null}
                {!postData.logined && (
                  <div className='flex items-center'>
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
                      onClick={() => handleEditPost()} // Trigger edit mode directly
                      className='w-16 h-8 px-1 mx-3 text-sm bg-white shadow-sm rounded-xl sm:text-xs shadow-black'>
                      수정
                    </button>
                    <button
                      onClick={handleDeletePost}
                      className='w-16 h-8 px-1 mx-3 text-sm bg-white shadow-sm rounded-xl sm:text-xs shadow-black'>
                      글 삭제
                    </button>
                  </div>
                )}
              </>
            )}
            {editMode && (
              <div className='flex items-center'>
                <button
                  onClick={handleSavePost}
                  className='w-16 h-8 px-1 mx-3 text-sm bg-white shadow-sm rounded-xl sm:text-xs shadow-black'>
                  저장
                </button>
                <button
                  onClick={handleCancelEdit}
                  className='w-16 h-8 px-1 mx-3 text-sm bg-white shadow-sm rounded-xl sm:text-xs shadow-black'>
                  취소
                </button>
              </div>
            )}
          </div>

          <div className='flex'>
            {!editMode && (
              <div className='my-4'>
                <p>댓글쓰기</p>
                <CommentForm postId={postId} />
              </div>
            )}
          </div>
          <div className='my-4'>
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
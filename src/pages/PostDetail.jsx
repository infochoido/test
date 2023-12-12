import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, deleteDoc, addDoc, collection, serverTimestamp, query, where, getDocs, orderBy, onSnapshot } from 'firebase/firestore';

const CommentForm = ({ postId }) => {
    const [content, setContent] = useState('');
    const [author, setAuthor] = useState('');
    const [password, setPassword] = useState('');
  
    const handleCommentSubmit = async (e) => {
      e.preventDefault();
  
      try {
        const commentsCollectionRef = collection(db, 'comments');
        await addDoc(commentsCollectionRef, {
          content,
          author,
          password,
          postId,
          createdAt: serverTimestamp(),
        });
  
        setContent('');
        setAuthor('');
        setPassword('');
      } catch (error) {
        console.error('Error adding comment:', error);
      }
    };
  
    return (
      <form onSubmit={handleCommentSubmit} className='flex flex-wrap p-1 m-3 space-y-2 border-2 md:space-y-0 md:space-x-1'>
        <div className='flex space-x-4'>
          <div className='mb-2 flex-1/2'>
            <label className='block text-xs'>닉네임:</label>
            <input className="w-full text-xs border-2 md:text-sm" type="text" value={author} onChange={(e) => setAuthor(e.target.value)} />
          </div>
          <div className='mb-2 flex-1/2'>
            <label className='block text-xs'>비밀번호:</label>
            <input className="w-full text-xs border-2 md:text-sm" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
        </div>
        <div className='w-full mb-2'> {/* 수정된 부분 */}
          <label className='block text-xs'>댓글:</label>
          <input className="w-full py-1 text-xs border-2 md:text-sm" value={content} onChange={(e) => setContent(e.target.value)} />
        </div>
        <button type="submit" className='w-full p-1 text-xs text-white md:w-auto md:text-sm rounded-sm bg-[#004C2F]'>
          댓글
        </button>
      </form>
    );
    
  };
  
  const CommentList = ({ postId }) => {
    const [comments, setComments] = useState([]);
    const [commentPasswords, setCommentPasswords] = useState({});
  
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
        console.error('Error fetching comments:', error);
      }
    };

    const setupCommentsListener = () => {
        const commentsCollectionRef = collection(db, 'comments');
        const commentsQuery = query(commentsCollectionRef, where('postId', '==', postId), orderBy('createdAt', 'asc'));
      
        const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
          const commentsData = [];
          snapshot.forEach((doc) => {
            commentsData.push({ id: doc.id, ...doc.data() });
          });
      
          setComments(commentsData);
        });
      
        return unsubscribe;
      };
  
      useEffect(() => {
        // Fetch initial comments
        fetchComments();
      
        // Set up real-time listener
        const unsubscribe = setupCommentsListener();
      
        // Clean up listener on component unmount
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
            alert("댓글이 삭제되었습니다")
            fetchComments();
          } else {
            console.log('비밀번호가 올바르지 않습니다.');
            alert("비밀번호가 올바르지 않습니다")
          }
        }
      } catch (error) {
        console.error('Error deleting comment:', error);
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
          <div key={comment.id} className="p-2 m-3 border-2">
            <p>{comment.content}</p>
            <div className='flex items-center justify-around space-x-3'>
                <p className='text-xs'>작성자: {comment.author}</p>
                <div>
                  <label className='text-xs'>
                  비밀번호:
                  <input className='border-2 ' type="password" onChange={(e) => handlePasswordChange(e, comment.id)} />
                  </label>
                </div>
                
            </div>
            <button className="p-1 text-xs text-white bg-[#004C2F] rounded-sm" onClick={() => handleCommentDelete(comment.id)}>
                댓글 삭제
            </button>
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
    <div className='mt-5'>
      {postData ? (
        <div>
          <table className='w-full'>
            <thead>
              <tr className='flex flex-col w-full'>
                <td className='flex items-center'><p className='text-sm font-normal text-gray-400'>제목 :</p>{postData.title}</td>
                <div className='flex space-x-3'>
                <td className='flex items-center'><p className='text-sm font-normal text-gray-400'>작성자 :</p> {postData.author}</td>
                <td className='flex items-center'><p className='text-sm font-normal text-gray-400'>작성날짜 :</p> {formatDateTime(postData.created_at.toDate())}</td>
                </div>
                <td className='w-full p-4 my-5 border-2 min-h-[200px] rounded-xl'>{postData.test}</td>
              </tr>
            </thead>
          </table>
          <div className='flex'>
            <label className='text-sm'>
              비밀번호 입력:
              <input
                type="password"
                value={passwordInput}
                onChange={handlePasswordChange}
                className='m-1 border-2'
              />
            </label>
            <button onClick={handleDeletePost} className='px-2 mx-5 text-sm bg-white shadow-sm rounded-xl shadow-black'>
            글 삭제
          </button>
          </div>
          
          {/* Include the CommentForm component */}
          <div className='my-10'>
          <p>댓글쓰기</p>
          <CommentForm postId={postId} />
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

import React, { useState, useEffect } from "react";
import { updateDoc, doc, collection, getDocs, query, where } from 'firebase/firestore';
import { auth, db, getUser } from '../firebase';

export default function MyPage() {
  const [user, setUser] = useState(null);
  const [userInfo, setUserInfo] = useState({
    name: "",
    nickname: "",
    email: "",
    profilePicture: "", // 프로필 사진 URL
  });

  useEffect(() => {
    const unsubscribe = getUser((userData) => {
      console.log("User data from getUser:", userData);
      setUser(userData);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const userEmail = user.email;

      getUserInfoByEmail(userEmail).then((userInfo) => {
        if (userInfo) {
          setUserInfo(userInfo);
        } else {
          setUserInfo({
            name: "",
            nickname: "",
            email: "",
            profilePicture: "",
          });
        }
      });
    } else {
      setUserInfo({
        name: "",
        nickname: "",
        email: "",
        profilePicture: "",
      });
    }
  }, [user]);

  const getUserInfoByEmail = async (userEmail) => {
    try {
      const q = query(collection(db, 'users'), where("email", "==", userEmail));
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        return {
          name: userData.name,
          nickname: userData.nickname,
          email: userEmail, // Include the email in userInfo
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
  

  const handleUpdateProfile = async (updatedData) => {
    try {
      const currentUser = auth.currentUser;

      if (currentUser) {
        const userEmail = currentUser.email;

        const q = query(collection(db, 'users'), where("email", "==", userEmail));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();

          const userId = querySnapshot.docs[0].id;
          const userDocRef = doc(collection(db, 'users'), userId);

          await updateDoc(userDocRef, {
            name: updatedData.name || userData.name,
            nickname: updatedData.nickname || userData.nickname,
          });

          console.log("사용자 정보가 성공적으로 업데이트되었습니다.");
          setUserInfo((prevUserInfo) => ({ ...prevUserInfo, ...updatedData }));
        } else {
          console.error("해당 이메일을 가진 사용자가 없습니다.");
        }
      } else {
        console.error("사용자 정보를 업데이트할 수 없습니다. 사용자가 로그인되어 있지 않습니다.");
      }
    } catch (error) {
      console.error("사용자 정보 업데이트 중 오류가 발생했습니다:", error.message);
    }
  };

  return (
    <div>
      <h1>마이페이지</h1>
      <div>
        <p>이름: {userInfo.name}</p>
        <p>닉네임: {userInfo.nickname}</p>
        <p>이메일: {userInfo.email}</p>
        <img
          src={userInfo.profilePicture}
          alt="프로필 사진"
          style={{ width: "100px", height: "100px", borderRadius: "50%" }}
          className="border-2 border-black"
        />
      </div>
      <div className="flex flex-col">
        <button onClick={() => handleUpdateProfile({ name: "새로운 이름" })}>이름 수정</button>
        <button onClick={() => handleUpdateProfile({ nickname: "새로운 닉네임" })}>닉네임 수정</button>
        {/* 프로필 사진 업데이트 기능은 추가적인 구현이 필요합니다. */}
        <input type="file" onChange={(e) => console.log("프로필 사진 업데이트 기능 구현 필요")} />
      </div>
    </div>
  );
}

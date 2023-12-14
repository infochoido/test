import React, { useState, useEffect } from "react";
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, doc, getDocs, query, where, updateDoc } from 'firebase/firestore';
import { auth, db, getUser } from '../firebase';
import { useRecoilState } from "recoil";
import { userProfileState } from '../recoilAtom';
import { updateProfile } from "firebase/auth";

const loadProfileFromLocalStorage = () => {
  const profileString = localStorage.getItem("userProfile");
  if (profileString) {
    return JSON.parse(profileString);
  }
  return null;
};

const saveProfileToLocalStorage = (profile) => {
  localStorage.setItem("userProfile", JSON.stringify(profile));
};

export default function MyPage() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useRecoilState(userProfileState);
  const [userInfo, setUserInfo] = useState(loadProfileFromLocalStorage() || {
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
          setUserProfile(userInfo);
        } else {
          setUserProfile({
            name: "",
            nickname: "",
            email: "",
            profilePicture: "",
          });
        }
      });
    } else {
      setUserProfile({
        name: "",
        nickname: "",
        email: "",
        profilePicture: "",
      });
    }
  }, [user, setUserProfile]);

  const getUserInfoByEmail = async (userEmail) => {
    try {
      const q = query(collection(db, 'users'), where("email", "==", userEmail));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        const profileInfo = {
          name: userData.name,
          nickname: userData.nickname,
          email: userEmail,
          profilePicture: userData.profilePicture || "",
        };
        saveProfileToLocalStorage(profileInfo);
        return profileInfo;
      } else {
        console.error("해당 이메일을 가진 사용자가 없습니다.");
        return null;
      }
    } catch (error) {
      console.error("사용자 정보 가져오기 중 오류가 발생했습니다:", error.message);
      return null;
    }
  };

  
  const updateProfilePicture = (downloadUrl) => {
    setUserInfo((prevUserInfo) => ({ ...prevUserInfo, profilePicture: downloadUrl }));
  };

  useEffect(() => {
    console.log("Updated UserProfile:", userProfile);
}, [userProfile]);


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

        // 프로필 사진이 업데이트된 경우
        if (updatedData.profilePicture) {
          const storage = getStorage();
          const storageRef = ref(storage, `profile_pictures/${userId}`);
          await uploadBytes(storageRef, updatedData.profilePicture);

          const downloadUrl = await getDownloadURL(storageRef);
          console.log("Download URL:", downloadUrl);

          // Firestore에 프로필 사진 URL 업데이트
          const userDocRef = doc(collection(db, 'users'), userId);
          await updateDoc(userDocRef, {
            profilePicture: downloadUrl,
            // 추가: photoURL 업데이트
            photoURL: downloadUrl,
          });

          console.log("프로필 사진이 성공적으로 업데이트되었습니다.");
          updateProfilePicture(downloadUrl);

          // Update the user's photoURL in the auth object
          await updateProfile(auth.currentUser, {
            photoURL: downloadUrl,
          });

          console.log("auth.photoURL이 성공적으로 업데이트되었습니다.");
        }

        // 이름과 닉네임 업데이트
        const userDocRef = doc(collection(db, 'users'), userId);
        await updateDoc(userDocRef, {
          name: updatedData.name || userData.name,
          nickname: updatedData.nickname || userData.nickname,
        });

        console.log("사용자 정보가 성공적으로 업데이트되었습니다.");
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
        <div className="flex flex-col">
          <img
            src={userInfo.profilePicture}
            alt="프로필 사진"
            style={{ width: "100px", height: "100px", borderRadius: "50%" }}
            className="border-2 border-black"
          />
          <input
            type="file"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                // 프로필 사진이 선택된 경우 handleUpdateProfile 호출
                handleUpdateProfile({ profilePicture: file });
              }
            }}
          />
        </div>
        <p>이름: {userInfo.name}</p>
        <p>닉네임: {userInfo.nickname}</p>
        <p>이메일: {userInfo.email}</p>
      </div>
    </div>
  );
}

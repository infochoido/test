import React, { useState, useEffect } from "react";
import { collection, addDoc, doc, getDoc, setDoc, updateDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { auth } from "../firebase";

// export const updateCoins = async (userEmail, amount) => {
//   try {
//     // Query Firestore to find the user with the matching email
//     const q = query(collection(db, 'users'), where("email", "==", userEmail));
//     const querySnapshot = await getDocs(q);

//     if (querySnapshot.size === 1) {
//       // There should be only one user with the matching email
//       const userDoc = querySnapshot.docs[0];
//       const currentCoins = userDoc.data().coins || 0;
//       const newCoins = currentCoins + amount;

//       // Update the user's coins
//       await updateDoc(userDoc.ref, { coins: newCoins });

//       console.log(`Coins updated successfully. New coins: ${newCoins}`);
//       return true;
//     } else if (querySnapshot.size === 0) {
//       console.error("User not found");
//       return false;
//     } else {
//       console.error("Multiple users found with the same email");
//       return false;
//     }
//   } catch (error) {
//     console.error("Error updating coins:", error.message);
//     return false;
//   }
// };

// export const mainWrite = async (newPostData, existingPostId) => {
//   try {
//     const postsCollectionRef = collection(db, "mainPosts");

//     if (existingPostId) {
//       // If editing an existing post, update the content
//       const postRef = doc(postsCollectionRef, existingPostId);
//       await setDoc(postRef, newPostData, { merge: true });
//       console.log("Post updated successfully with ID:", existingPostId);
//     } else {
//       // If creating a new post, add a new document
//       const newPostDocRef = await addDoc(postsCollectionRef, newPostData);
//       console.log("Post added successfully with ID:", newPostDocRef.id);
//     }
//   } catch (error) {
//     console.error("Error adding/updating post:", error.message);
//   }
// };

// export const getPost = async (postId) => {
//   try {
//     const postRef = doc(collection(db, "mainPosts"), postId);
//     const postSnapshot = await getDoc(postRef);

//     if (postSnapshot.exists()) {
//       return postSnapshot.data();
//     } else {
//       console.error("Post not found");
//       return null;
//     }
//   } catch (error) {
//     console.error("Error getting post:", error.message);
//     return null;
//   }
// };

export default function Home() {
  const [isEditing, setIsEditing] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [existingPostId, setExistingPostId] = useState(null);
  const [userCoins, setUserCoins] = useState(0); // State to store the user's current coins

  // useEffect(() => {
  //   const fetchPostContent = async () => {
  //     const postContent = await getPost(existingPostId);
  //     if (postContent) {
  //       setNewPostContent(postContent.content);
  //     }
  //   };

  //   const fetchUserCoins = async () => {
  //     try {
  //       const user = auth.currentUser;
  //       if (!user) {
  //         console.error("User not authenticated.");
  //         return;
  //       }

  //       const userEmail = user.email;

  //       // Query Firestore to find the user with the matching email
  //       const q = query(collection(db, "users"), where("email", "==", userEmail));
  //       const querySnapshot = await getDocs(q);

  //       if (querySnapshot.size === 1) {
  //         // There should be only one user with the matching email
  //         const userDoc = querySnapshot.docs[0];
  //         setUserCoins(userDoc.data().coins || 0);
  //       } else if (querySnapshot.size === 0) {
  //         console.error("User not found");
  //       } else {
  //         console.error("Multiple users found with the same email");
  //       }
  //     } catch (error) {
  //       console.error("Error fetching user coins:", error.message);
  //     }
  //   };

  //   if (isEditing && existingPostId) {
  //     fetchPostContent();
  //   }

  //   fetchUserCoins();
  // }, [isEditing, existingPostId]);

  // const handleMainWrite = async () => {
  //   try {
  //     const newPostData = {
  //       content: newPostContent,
  //       // Add other necessary data
  //     };

  //     if (!isEditing) {
  //       // Deduct 200 coins when creating a new post
  //       const user = auth.currentUser;
  //       if (!user) {
  //         console.error("User not authenticated.");
  //         return;
  //       }

  //       const userEmail = user.email;

  //       const updatedCoins = await updateCoins(userEmail, -200);
  //       if (!updatedCoins) {
  //         console.error("Not enough coins to write a post.");
  //         return;
  //       }

  //       // Update the userCoins state after deduction
  //       setUserCoins((prevCoins) => prevCoins - 200);
  //     }

  //     await mainWrite(newPostData, "rJCE4yCTJLw8hr1NhOc4");

  //     console.log("Post added or updated successfully.");

  //     setNewPostContent("");
  //     setIsEditing(false);
  //     setExistingPostId(null);
  //   } catch (error) {
  //     console.error("Error handling main write:", error.message);
  //   }
  // };


  return (
    <div className="relative w-full my-5 font-black text-center">
      <p style={{ fontSize: "6vw" }}>CHOI DOHYUN COMMUNITY</p>
      <div className="flex justify-center h-96">
        <div className="relative overflow-hidden rounded-2xl max-w-[500px] w-full m-5">
          <img src="/woo.jpg" alt="Woo" className="object-cover w-full h-full" />
          <p
            className="absolute bottom-0 m-4 text-4xl font-bold text-center text-white"
            style={{ textShadow: "2px 2px 4px rgba(0, 0, 0, 0.8)" }}
          >
            우정서
          </p>
        </div>
        <div className="relative overflow-hidden rounded-2xl max-w-[500px] w-full m-5">
          <img src="/park.jpg" alt="park" className="object-cover w-full h-full" />
          <p
            className="absolute bottom-0 m-4 text-4xl font-bold text-center text-white"
            style={{ textShadow: "2px 2px 4px rgba(0, 0, 0, 0.8)" }}
          >
            박재원
          </p>
        </div>
      </div>

      {/* <div className="flex flex-col">
          {isEditing ? (
            <input
              type="text"
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              className="w-full text-center"
            />
          ) : (
            <p className="w-full text-center">{newPostContent}</p>
          )}
          {isEditing ? (
            <>
              <button onClick={handleMainWrite}>확인 (코인: 200 coins 차감)</button>
              <button onClick={() => setIsEditing(false)}>취소</button>
            </>
          ) : (
            <button onClick={() => setIsEditing(true)}>메인화면 글쓰기</button>
          )}
        </div>

      {/* Display the user's current coin count */}
      {/* <p>Current Coins: {userCoins}</p> */}
    </div>
  );
}

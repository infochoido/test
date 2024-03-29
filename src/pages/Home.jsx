import React, { useState, useEffect } from "react";
import { collection, addDoc, doc, getDoc, setDoc, updateDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { auth } from "../firebase";
import MainQuote from "../components/MainQuote";
import Lottery from "../components/Lottery";



export default function Home() {
  const [isEditing, setIsEditing] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [existingPostId, setExistingPostId] = useState(null);
  const [userCoins, setUserCoins] = useState(0); // State to store the user's current coins

  useEffect(() => {
    // Clear refreshed status in localStorage when home screen is visited
    localStorage.removeItem("refreshed");
  }, []);

  return (
    <div className="relative w-full my-5 font-black text-center">
      <p style={{ fontSize: "6vw" }}>CHOI DOHYUN COMMUNITY</p>
      {/* <div className="flex justify-center h-96">
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
      </div> */}
      <Lottery />
      <div className="mb-40">
      <MainQuote />
      </div>

      
    </div>
  );
}

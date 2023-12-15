import React, { useState, useEffect } from "react";
import { getDoc, doc, collection, updateDoc, query, getDocs, where, setDoc, orderBy } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { getUser } from "../firebase";

export default function Doto() {
  const [betAmount, setBetAmount] = useState(10);
  const [userData, setUserData] = useState(null);
  const [userProfile, setUserProfile] = useState({ coins: 0 });
  const [gameResult, setGameResult] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  

  useEffect(() => {
    const unsubscribe = getUser((userData) => {
      fetchUserCoins(userData.email);
      fetchLeaderboard();
    });
    return () => unsubscribe();
  }, []);

  const fetchUserCoins = async (userEmail) => {
    try {
      const userCoins = await getUserInfoByEmail(userEmail);
      if (userCoins) {
        setUserProfile(userCoins);
      }
    } catch (error) {
      console.error("Error fetching user coins:", error.message);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const leaderboardQuery = query(collection(db, 'users'), orderBy("coins", "desc"));
      const leaderboardSnapshot = await getDocs(leaderboardQuery);
      const leaderboardData = leaderboardSnapshot.docs.map(doc => doc.data());
      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error("Error fetching leaderboard:", error.message);
    }
  };

  const getUserInfoByEmail = async (userEmail) => {
    try {
      const q = query(collection(db, 'users'), where("email", "==", userEmail));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        console.log(userData)
        setUserData(userData)
        const profileInfo = {
          coins: userData.coins || 0,
        };
        return profileInfo;
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error fetching user info by email:", error.message);
      return null;
    }
  };

  const handleBet = async (isEven) => {
    try {
      // Generate a random result (0 for 홀, 1 for 짝)
      const randomResult = Math.floor(Math.random() * 2);
  
      // Calculate winnings based on the bet result
      const winnings = randomResult === (isEven ? 0 : 1) ? betAmount : -betAmount;
  
      // Update user's coins in the database
      const q = query(collection(db, 'users'), where("email", "==", userData.email));
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        const userDocRef = querySnapshot.docs[0].ref;
  
        // User document exists, update coins
        await updateDoc(userDocRef, {
          coins: userProfile.coins + winnings,
        });
  
        // Fetch updated user coins
        fetchUserCoins(userData.email);
  
        // Set the game result for display
        setGameResult(randomResult === 0 ? "홀" : "짝");
  
        console.log("Bet successful!");
      } else {
        console.error("User document not found for email:", userData.email);
      }
    } catch (error) {
      console.error("Error updating user coins:", error.message);
    }
  };

  return (
    <>
      <div className="flex flex-col justify-center w-full mt-4">
        <div className="p-3 m-auto space-y-3 border-2">
          <p className="mb-5 text-xl">도토(도현토토)</p>
          {userData ? (
            <>
              <p>{userData.nickname} 님</p>
              <p>현재 남은 코인: {userProfile.coins}</p>
              <p>게임 결과: {gameResult}</p>
              <div className="space-x-3 space-y-3">
                <p>
                  {" "}
                  베팅할 코인개수:{" "}
                  <input
                    type="number"
                    className="border-2"
                    value={betAmount}
                    onChange={(e) =>
                      setBetAmount(
                        Math.max(10, parseInt(e.target.value)) || 0
                      )
                    }
                    step="10"
                    min="10"
                    defaultValue="10"
                  />{" "}
                </p>
  
                <div className="flex justify-center space-x-3">
                  <button
                    className="p-10 text-xl text-white bg-green-600 shadow-md rounded-xl shadow-black"
                    onClick={() => handleBet(true)}
                  >
                    홀
                  </button>
                  <button
                    className="p-10 text-xl text-white bg-green-600 shadow-md rounded-xl shadow-black"
                    onClick={() => handleBet(false)}
                  >
                    짝
                  </button>
                </div>
              </div>
              <div>
                <p className="mt-4 text-xl">코인 랭킹</p>
                <table className="w-full border">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="border">Rank</th>
                      <th className="border">Nickname</th>
                      <th className="border">Coins</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((user, index) => (
                      <tr key={index} className="bg-white">
                        <td className="border">{index + 1}</td>
                        <td className="border">{user.nickname}</td>
                        <td className="border">{user.coins}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </div>
    </>
  );
          }
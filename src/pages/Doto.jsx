import React, { useState, useEffect } from "react";
import {
  getDoc,
  addDoc,
  doc,
  collection,
  updateDoc,
  query,
  getDocs,
  where,
  setDoc,
  orderBy,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { getUser } from "../firebase";
import { serverTimestamp } from "firebase/firestore";

export default function Doto() {
  const [betAmount, setBetAmount] = useState(10);
  const [userData, setUserData] = useState(null);
  const [userProfile, setUserProfile] = useState({ coins: 0 });
  const [gameResult, setGameResult] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [activeSection, setActiveSection] = useState("doto");
  const [lotteryTotalAmount, setLotteryTotalAmount] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(24 * 60 * 60); // Initial countdown time in seconds
  const [isLotteryDrawn, setIsLotteryDrawn] = useState(false);
  const [lotteryDocId, setLotteryDocId] = useState(null);


  const handleMenuClick = (section) => {
    setActiveSection(section);
  };



  useEffect(() => {
    const unsubscribe = getUser((userData) => {
      if (userData) {
        fetchUserCoins(userData.email);
        fetchLeaderboard();
      }
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
      const leaderboardQuery = query(
        collection(db, "users"),
        orderBy("coins", "desc")
      );
      const leaderboardSnapshot = await getDocs(leaderboardQuery);
      const leaderboardData = leaderboardSnapshot.docs.map((doc) => doc.data());
      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error("Error fetching leaderboard:", error.message);
    }
  };

  const getUserInfoByEmail = async (userEmail) => {
    try {
      const q = query(collection(db, "users"), where("email", "==", userEmail));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        console.log(userData);
        setUserData(userData);
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

      if (userProfile.coins < betAmount) {
        alert("코인이 부족합니다!");
        return;
      }

      // Calculate winnings based on the bet result
      const winnings =
        randomResult === (isEven ? 0 : 1) ? betAmount : -betAmount;

      // Update user's coins in the database
      const q = query(
        collection(db, "users"),
        where("email", "==", userData.email)
      );
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
    } finally {
      // Enable the button after a delay
      setTimeout(() => {
        setIsButtonDisabled(false);
      }, 300);
    }
  };


  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return `${hours}시간 ${minutes}분 ${remainingSeconds}초`;
  };

  return (
    <>
      <div className="flex flex-col justify-center w-full mt-4 mb-36">
        <div className="p-3 m-auto space-y-3 border-2">
          <div className="flex justify-center space-x-5">
            <button
              className={`text-lg p-1 ${
                activeSection === "doto" ? "font-bold bg-gray-200" : ""
              }`}
              onClick={() => handleMenuClick("doto")}
            >
              도토
            </button>
          </div>

          {activeSection === "doto" && userData ? (
            <>
              <p className="mb-5 text-xl">도토(도현토토)</p>
              <p>{userData.nickname} 님</p>
              <p>현재 남은 코인: {userProfile.coins}</p>
              <p>게임 결과: {gameResult}</p>
              <div className="space-x-3 space-y-3">
                <p>
                  {" "}
                  베팅할 코인개수:{" "}
                  <input
                    type="number"
                    className="w-32 border-2"
                    value={betAmount}
                    onChange={(e) =>
                      setBetAmount(
                        Math.max(10, Math.min(100, parseInt(e.target.value))) ||
                          0
                      )
                    }
                    step="10"
                    min="10"
                  />{" "}
                  <button
                    onClick={() =>
                      setBetAmount((prevAmount) =>
                        Math.min(100, prevAmount + 10)
                      )
                    }
                    className="mx-1"
                  >
                    up
                  </button>
                  <button
                    onClick={() =>
                      setBetAmount((prevAmount) =>
                        Math.max(10, prevAmount - 10)
                      )
                    }
                    className="mx-1"
                  >
                    down
                  </button>
                </p>

                <div className="flex justify-center space-x-3">
                  <button
                    className={`p-10 text-xl text-white shadow-md rounded-xl shadow-black ${
                      isButtonDisabled ? "bg-green-800" : "bg-green-600"
                    }`}
                    onClick={() => handleBet(true)}
                    disabled={isButtonDisabled}
                  >
                    홀
                  </button>
                  <button
                    className={`p-10 text-xl text-white shadow-md rounded-xl shadow-black ${
                      isButtonDisabled ? "bg-green-800" : "bg-green-600"
                    }`}
                    onClick={() => handleBet(false)}
                    disabled={isButtonDisabled}
                  >
                    짝
                  </button>
                </div>
              </div>
            </>
          ) :
            <p>loading...</p>
                  }

          <div className="">
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
        </div>
      </div>
    </>
  );
}
  
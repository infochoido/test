import React, { useState, useEffect } from "react";
import { getDoc,addDoc, doc, collection, updateDoc, query, getDocs, where, setDoc, orderBy } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { getUser } from "../firebase";

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

  useEffect(() => {
    // Fetch the lottery document when the component mounts
    fetchLotteryDoc();

  }, []);

  const fetchLotteryDoc = async () => {
    try {
      const lotteryQuery = query(collection(db, "lottery"));
      const lotterySnapshot = await getDocs(lotteryQuery);
  
      if (!lotterySnapshot.empty) {
        const lotteryData = lotterySnapshot.docs[0].data();
        setLotteryDocId(lotterySnapshot.docs[0].id);
        setTimeRemaining(lotteryData.countdownTime);
        setLotteryTotalAmount(lotteryData.totalAmount);
        console.log("Lottery Data:", lotteryData);
      } else {
        // Create a new lottery document if it doesn't exist
        const newLotteryDocRef = await addDoc(collection(db, "lottery"), {
          countdownTime: 24 * 60 * 60, // Initial countdown time in seconds
          totalAmount: 0, // Initial total amount
        });
        setLotteryDocId(newLotteryDocRef.id);
        console.log("New lottery document created:", newLotteryDocRef.id);
      }
    } catch (error) {
      console.error("Error fetching/creating lottery document:", error.message);
    }
  };

  const handleMenuClick = (section) => {
    setActiveSection(section);
  };
  
  useEffect(() => {
    let interval;

    // Update the countdown every second
    if (timeRemaining > 0 && !isLotteryDrawn) {
      interval = setInterval(() => {
        setTimeRemaining((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeRemaining <= 0 && !isLotteryDrawn) {
      // Perform the lottery draw when the countdown reaches zero
      performLotteryDraw();
      setIsLotteryDrawn(true);
    }
    return () => clearInterval(interval);
  }, [timeRemaining, isLotteryDrawn]);
  

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
    } finally {
      // Enable the button after a delay
      setTimeout(() => {
        setIsButtonDisabled(false);
      }, 300);
    }
  };

  const handleLotteryPurchase = async () => {
    try {
      const q = query(collection(db, "users"), where("email", "==", userData.email));
      const querySnapshot = await getDocs(q);
  
      // Check if the user has enough coins to purchase a lottery ticket
      if (userProfile.coins >= 100) {
        const userDocRef = querySnapshot.docs[0].ref;
  
        // Deduct 100 coins from the user's balance
        await updateDoc(userDocRef, {
          coins: userProfile.coins - 100,
        });
  
        // Update the user's coins locally
        setUserProfile((prevProfile) => ({
          ...prevProfile,
          coins: prevProfile.coins - 100,
        }));
  
        // Update the total amount spent on lottery tickets
        setLotteryTotalAmount((prevAmount) => prevAmount + 100);
  
        // Start the countdown for lottery draw (e.g., set a timeout for 24 hours)
        setTimeout(() => {
          // Perform the lottery draw here
          performLotteryDraw();
        }, 24 * 60 * 60 * 1000); // 24 hours in milliseconds
      } else {
        alert("코인이 부족합니다!");
      }
    } catch (error) {
      console.error("Error purchasing lottery ticket:", error.message);
    }
  };

  const performLotteryDraw = async () => {
    try {
      // Update the countdown time in the database
      const lotteryDocRef = doc(db, "lottery", lotteryDocId);
      await updateDoc(lotteryDocRef, {
        countdownTime: 24 * 60 * 60,
        totalAmount: 0, // Reset countdown time to 24 hours and reset total amount
      });
  
      console.log(lotteryDocRef);
  
      // Add your logic for lottery draw here
      console.log("Performing lottery draw...");
  
      // For example, select a random user from the database
      const lotteryParticipants = await getDocs(collection(db, "users"));
      const randomIndex = Math.floor(Math.random() * lotteryParticipants.size);
      const winnerDoc = lotteryParticipants.docs[randomIndex];
  
      // Get the winner's data
      const winnerData = winnerDoc.data();
      console.log("Winner:", winnerData);
  
      // Award coins to the winner (you can define your own logic for this)
      const winnerDocRef = winnerDoc.ref;
      await updateDoc(winnerDocRef, {
        coins: winnerData.coins + lotteryTotalAmount, // Awarding the accumulated total amount
      });
  
      // Update the leaderboard after the lottery draw
      fetchLeaderboard();
  
      console.log("Lottery draw completed!");
    } catch (error) {
      console.error("Error performing lottery draw:", error.message);
    }
  };

  // const updateWinnerCoins = async (winnerEmail, prizeCoins) => {
  //   try {
  //     const q = query(collection(db, 'users'), where("email", "==", winnerEmail));
  //     const querySnapshot = await getDocs(q);

  //     if (!querySnapshot.empty) {
  //       const winnerDocRef = querySnapshot.docs[0].ref;

  //       // Update winner's coins
  //       await updateDoc(winnerDocRef, {
  //         coins: prizeCoins + (winnerDocRef.data().coins || 0),
  //       });

  //       // Fetch updated user coins
  //       fetchUserCoins(userData.email);
  //     }
  //   } catch (error) {
  //     console.error("Error updating winner's coins:", error.message);
  //   }
  // };
  
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
              className={`text-lg p-1 ${activeSection === "doto" ? "font-bold bg-gray-200" : ""}`}
              onClick={() => handleMenuClick("doto")}
            >
              도토
            </button>
            <button
              className={`text-lg p-1 ${activeSection === "lottery" ? "font-bold bg-gray-200" : ""}`}
              onClick={() => handleMenuClick("lottery")}
            >
              복권
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
                        Math.max(10, Math.min(100, parseInt(e.target.value))) || 0
                      )
                    }
                    step="10"
                    min="10"
                  />{" "}
                  <button
                    onClick={() => setBetAmount((prevAmount) => Math.min(100, prevAmount + 10))}
                    className="mx-1"
                  >
                    up
                  </button>
                  <button
                    onClick={() => setBetAmount((prevAmount) => Math.max(10, prevAmount - 10))}
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
          ) : activeSection === "lottery" ? (
            <>
              <div className="space-y-3">
                <p className="text-xl w-[320px]">복권 구매(개발중)</p>
                <p>현재 남은 코인: {userProfile.coins}</p>
                <p>현재 총 누적 금액: {lotteryTotalAmount}</p>
                <button
                  onClick={handleLotteryPurchase}
                  className="px-1 text-white bg-green-600"
                  //disabled={isLotteryDrawn}
                  disabled="true"
                >
                  복권 구매하기
                </button>
                <p>가격 100코인</p>
                {isLotteryDrawn ? (
                  <p>복권 추첨 결과: 추첨 완료</p>
                ) : (
                  <p>복권 추첨까지 남은 시간: {formatTime(timeRemaining)}</p>
                )}
              </div>
            </>
          ) : (
            <p>loading...</p>
          )}

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
  
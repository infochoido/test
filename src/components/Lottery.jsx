import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { query, collection, where, getDocs, updateDoc, doc, setDoc, getDoc, addDoc, onSnapshot } from "firebase/firestore";

export default function Lottery() {
  const [mycoin, setMycoin] = useState(0);
  const [userEmail, setUserEmail] = useState("");
  const [remainingTime, setRemainingTime] = useState(0);
  const [accumulatedAmount, setAccumulatedAmount] = useState(0);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const userEmail = currentUser.email;
      setUserEmail(userEmail);
    }

    const fetchCoinInfo = async () => {
      try {
        const q = query(collection(db, "users"), where("email", "==", userEmail));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          const userCoinInfo = userData.coins || 0; // assuming coins is a number
          setMycoin(userCoinInfo);
        }
      } catch (error) {
        console.error(error.message);
      }
    };

    const fetchLotteryInfo = async () => {
      try {
        const lotteryQuery = query(collection(db, "lottery"));
        const lotterySnapshot = await getDocs(lotteryQuery);

        if (!lotterySnapshot.empty) {
          const lotteryData = lotterySnapshot.docs[0].data();
          setRemainingTime(lotteryData?.추첨남은시각 || 0);
          setAccumulatedAmount(lotteryData?.누적금액 || 0);
        }
      } catch (error) {
        console.error(error.message);
      }
    };

    // Fetch initial data
    fetchCoinInfo();
    fetchLotteryInfo();

    // Set up an interval to update the remaining time
    const intervalId = setInterval(() => {
      setRemainingTime(calculateRemainingTime());
    }, 1000);

    // Set up onSnapshot for real-time updates
    const lotteryDocRef = collection(db, "lottery");
    const unsubscribe = onSnapshot(lotteryDocRef, (snapshot) => {
      snapshot.forEach((doc) => {
        const data = doc.data();
        setRemainingTime(data?.추첨남은시각 || 0);
        setAccumulatedAmount(data?.누적금액 || 0);
      });
    });

    // Cleanup functions
    return () => {
      clearInterval(intervalId);
      unsubscribe();
    };
  }, [userEmail]);

  const lotteryPurchase = async () => {
    try {
      // Deduct 500 coins
      const updatedCoins = mycoin - 500;

      // Update the user's coins locally
      setMycoin(updatedCoins);

      // Update the user's coins in the database
      const userRef = collection(db, "users");
      const userQuery = query(userRef, where("email", "==", userEmail));
      const userSnapshot = await getDocs(userQuery);

      if (!userSnapshot.empty) {
        const userDoc = userSnapshot.docs[0];
        await updateDoc(userDoc.ref, { coins: updatedCoins });
      }

      // Get the existing lottery document or create a new one if it doesn't exist
      const lotteryQuery = query(collection(db, "lottery"));
      const lotterySnapshot = await getDocs(lotteryQuery);

      if (lotterySnapshot.empty) {
        // If the lottery document doesn't exist, create a new one
        const newLotteryDocRef = await addDoc(collection(db, "lottery"), {
          누적금액: 500,
          buyers: [userEmail],
        });

        console.log("New lottery document created:", newLotteryDocRef.id);
      } else {
        // If the lottery document exists, update it
        const lotteryDoc = lotterySnapshot.docs[0];
        const currentAmount = lotteryDoc.data().누적금액 || 0;
        const currentBuyersList = lotteryDoc.data().buyers || [];

        const updatedBuyersList = [...currentBuyersList, userEmail];

        // Update the lottery document with the new data
        await updateDoc(lotteryDoc.ref, {
          누적금액: currentAmount + 500,
          buyers: updatedBuyersList,
        });
      }
    } catch (error) {
      console.error("Error purchasing lottery ticket:", error.message);
    }

    if (remainingTime === 0) {
        try {
          const lotteryDocRef = collection(db, "lottery");
          const lotteryQuery = query(lotteryDocRef);
          const lotterySnapshot = await getDocs(lotteryQuery);
  
          if (!lotterySnapshot.empty) {
            const lotteryDoc = lotterySnapshot.docs[0];
            const buyersList = lotteryDoc.data().buyers || [];
  
            // Select a random winner
            const randomIndex = Math.floor(Math.random() * buyersList.length);
            const winner = buyersList[randomIndex];
  
            // Award the entire accumulated amount to the winner
            const prize = lotteryDoc.data().누적금액 || 0;
  
            // Reset the lottery document for the next round
            await setDoc(lotteryDoc.ref, {
              누적금액: 0,
              buyers: [],
            });
  
            console.log(`축하합니다! ${winner}님이 ${prize}코인을 획득하셨습니다!`);
          }
        } catch (error) {
          console.error("Error awarding prize:", error.message);
        }
      }
  };

  // Function to calculate remaining time until midnight
  const calculateRemainingTime = () => {
    const currentDate = new Date();
    const midnight = new Date(currentDate);
    midnight.setHours(24, 0, 0, 0); // Set to midnight of the current date

    const remainingTimeInSeconds = Math.floor((midnight - currentDate) / 1000);
    return remainingTimeInSeconds;
  };

  return (
    <div>
      <p>복권</p>
      <p>현재 코인: {mycoin}</p>
      <p>남은 시간: {remainingTime}</p>
      <p>누적금액: {accumulatedAmount}</p>
      <button onClick={lotteryPurchase}>복권구매하기</button>
    </div>
  );
}

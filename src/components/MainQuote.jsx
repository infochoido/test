import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { query, collection, where, getDocs, updateDoc, doc, setDoc, getDoc } from "firebase/firestore";

export default function MainQuote() {
  const [myCoinInfo, setMyCoinInfo] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [quoteInput, setQuoteInput] = useState("");
  const [mainQuoteId, setMainQuoteId] = useState("commonId");
  const [mainQuote, setMainQuote] = useState("");

  useEffect(() => {
    // Retrieve myCoinInfo and mainQuote from localStorage on component mount
    const storedCoinInfo = JSON.parse(localStorage.getItem("myCoinInfo"));
    if (storedCoinInfo) {
      setMyCoinInfo(storedCoinInfo);
    }

    const storedMainQuote = localStorage.getItem("mainQuote");
    if (storedMainQuote) {
      setMainQuote(storedMainQuote);
    }

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
          const userCoinInfo = {
            coins: userData.coins,
          };
          setMyCoinInfo(userCoinInfo);

          // Save myCoinInfo to localStorage
          localStorage.setItem("myCoinInfo", JSON.stringify(userCoinInfo));
        }
      } catch (error) {
        console.error(error.message);
      }
    };

    fetchCoinInfo();
  }, [userEmail]);

  useEffect(() => {
    // Save mainQuote to localStorage when it changes
    localStorage.setItem("mainQuote", mainQuote);
  }, [mainQuote]);

  const handleSaveQuote = async () => {
    try {
      const currentUser = auth.currentUser;

      if (currentUser) {
        const userEmail = currentUser.email;
        setUserEmail(userEmail);

        const userQuery = query(collection(db, "users"), where("email", "==", userEmail));
        const userQuerySnapshot = await getDocs(userQuery);

        if (!userQuerySnapshot.empty) {
          const userDocRef = userQuerySnapshot.docs[0].ref;
          const userData = userQuerySnapshot.docs[0].data();

          if (userData.coins >= 200) {
            const updatedCoins = userData.coins - 200;

            await updateDoc(userDocRef, { coins: updatedCoins });
            setMyCoinInfo({ coins: updatedCoins });

            const mainQuoteRef = doc(db, "mainQuote", mainQuoteId);
            const mainQuoteDocSnap = await getDoc(mainQuoteRef);

            if (!mainQuoteDocSnap.exists()) {
              await setDoc(mainQuoteRef, { quote: "" });
            }

            await updateDoc(mainQuoteRef, { quote: quoteInput });
            setMainQuote(quoteInput);

            // Save myCoinInfo to localStorage
            localStorage.setItem("myCoinInfo", JSON.stringify({ coins: updatedCoins }));

            setEditMode(false);
          } else {
            console.log("Not enough coins to save the quote.");
          }
        } else {
          console.log("User document not found.");
        }
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleEdit = () => {
    // Set the quoteInput to the current mainQuote value when entering edit mode
    setQuoteInput(mainQuote);
    setEditMode(true);
  };

  return (
    <div>
      {editMode ? (
        <div className="flex flex-col justify-center w-full space-y-2">
          <textarea className="w-full border-2 " value={quoteInput} onChange={(e) => setQuoteInput(e.target.value)} />
          <div className="flex items-center space-x-2">
            <button onClick={handleSaveQuote} className="w-20 px-1 border-2">저장</button>
            <button onClick={() => setEditMode(false)} className="w-20 px-1 border-2" >취소</button>
            <p className="text-xs">*200코인이 차감됩니다</p>
          </div>
        
          {myCoinInfo && <p>남은 Coin: {myCoinInfo.coins}</p>}
        </div>
      ) : (
        <>
          <p className="text-5xl">{mainQuote}</p>
          <button onClick={handleEdit}>글쓰기</button>
        </>
      )}
    </div>
  );
}

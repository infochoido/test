import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

const GunGames = () => {
  const pathname = window.location.pathname;
  const gameId = pathname.split('/').pop();
  const playerCollectionRef = collection(db, 'gunGames', gameId, 'players');
  const [player1DocId, setPlayer1DocId] = useState();
  const [player2DocId, setPlayer2DocId] = useState();
  const [uId, setUid] = useState(null);
  const [players, setPlayers] = useState({
    player1: { userId: 'player1', x: 0, y: 0 },
    player2: { userId: 'player2', x: 10, y: 0 },
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUid(user.uid);
      } else {
        setUid(null);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const getMyPlayers = async (uid) => {
    try {
      if (uid) {
        const playerQuery = query(playerCollectionRef, where('userId', '==', uid));
        const playerQuerySnapshot = await getDocs(playerQuery);
  
        if (!playerQuerySnapshot.empty) {
          const playerDoc = playerQuerySnapshot.docs[0];
          const playerData = playerDoc.data();
          console.log('Player Data:', playerData);
  
          const playerKey = `player${playerData.playerOrder}`;
          const updatedPlayer = {
            ...players[playerKey],
            position: playerData.position || { x: 0, y: 0 },
          };
  
          setPlayers((prevPlayers) => ({
            ...prevPlayers,
            [playerKey]: updatedPlayer,
          }));
        } else {
          console.log('Player not found');
        }
      }
    } catch (error) {
      console.error('Error fetching player data:', error);
    }
  };
  

  const getPlayers = async () => {
    try {
      const allPlayersQuery = await getDocs(playerCollectionRef);

      allPlayersQuery.forEach((playerDoc) => {
        const playerData = playerDoc.data();
        const playerId = playerDoc.id;

        if (playerData.playerOrder === 1) {
          
          setPlayer1DocId(playerId);
        } else if (playerData.playerOrder === 2) {
          
          setPlayer2DocId(playerId);
        }
      });

      console.log('Player 1 ID:', player1DocId);
      console.log('Player 2 ID:', player2DocId);
    } catch (error) {
      console.error('Error fetching all players data:', error);
    }
  };

  const handleMove = async (direction) => {
    try {
        const activePlayerOrder = players.player1.userId === uId ? 1 : 2;
        const activePlayerKey = `player${activePlayerOrder}`;

        const playerDocRef = doc(playerCollectionRef, activePlayerKey === 'player1' ? player1DocId : player2DocId);

        console.log('Active Player Key:', activePlayerKey);
    console.log('Current User ID:', uId);
      const playerDocSnapshot = await getDoc(playerDocRef);

      if (playerDocSnapshot.exists()) {
        const currentPosition = players[activePlayerKey].position || { x: 0, y: 0 };

        let newPosition;

        switch (direction) {
          case 'up':
            newPosition = { x: currentPosition.x, y: currentPosition.y - 1 };
            break;
          case 'down':
            newPosition = { x: currentPosition.x, y: currentPosition.y + 1 };
            break;
          case 'left':
            newPosition = { x: currentPosition.x - 1, y: currentPosition.y };
            break;
          case 'right':
            newPosition = { x: currentPosition.x + 1, y: currentPosition.y };
            break;
          default:
            return;
        }

        const updatedPlayerDocSnapshot = await getDoc(playerDocRef);
        const updatedPlayerData = updatedPlayerDocSnapshot.data();

        await updateDoc(playerDocRef, { position: newPosition });

        setPlayers((prevPlayers) => ({
            ...prevPlayers,
            [activePlayerKey]: {
              ...prevPlayers[activePlayerKey],
              position: updatedPlayerData.position || { x: 0, y: 0 },
            },
          }));
      } else {
        console.log(`Document for ${activePlayerKey} does not exist.`);
      }
    } catch (error) {
      console.error('Error updating player position:', error);
    }
  };

  useEffect(() => {
    if (auth.currentUser) {
      getMyPlayers(uId);
      getPlayers();
    }
  }, [uId]);
  
  useEffect(() => {
    console.log('Player 1 ID:', player1DocId);
    console.log('Player 2 ID:', player2DocId);
  }, [player1DocId, player2DocId]);

  return (
    <div>
      <p className='text-2xl'>게임화면</p>
      <div className='w-[300px] h-[300px] border-2 border-black' style={{ position: 'relative' }}>
        {players.player1.position && (
          <div
            style={{
              position: 'absolute',
              top: `${players.player1.position.y * 20}px`,
              left: `${players.player1.position.x * 20}px`,
              width: '20px',
              height: '20px',
              backgroundColor: 'red',
            }}
          />
        )}
        {players.player2.position && (
          <div
            style={{
              position: 'absolute',
              top: `${players.player2.position.y * 20}px`,
              left: `${players.player2.position.x * 20}px`,
              width: '20px',
              height: '20px',
              backgroundColor: 'blue',
            }}
          />
        )}
      </div>
      <div className='space-x-2'>
        <button onClick={() => handleMove('up')}>↑</button>
        <button onClick={() => handleMove('down')}>↓</button>
        <button onClick={() => handleMove('left')}>←</button>
        <button onClick={() => handleMove('right')}>→</button>
      </div>
    </div>
  );
};

export default GunGames;
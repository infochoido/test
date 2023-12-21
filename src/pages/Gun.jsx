import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { collection, onSnapshot, addDoc ,query, where, serverTimestamp,updateDoc,  deleteDoc,getDocs, doc, getDoc } from 'firebase/firestore';

const Gun = () => {
  const [games, setGames] = useState([]);
  const [createdRoomId, setCreatedRoomId] = useState(null);
  const [isJoining, setIsJoining] = useState(false);
  const navigate = useNavigate();
  const unsubscribePlayers = useRef([]);

  const navigateToGamePage = (gameId) => {
    navigate(`/gameplay/${gameId}`);
  };

  useEffect(() => {
    let unsubscribeGames;

    const isUserInCurrentRoom = (userId, currentGame) => {
        return currentGame.players.some((player) => player.userId === userId);
      };
  
    const cleanupPlayerSubscriptions = () => {
      // Clean up player unsubscribe functions
      unsubscribePlayers.current.forEach((playerUnsubscribe) => {
        if (playerUnsubscribe) {
          playerUnsubscribe();
        }
      });
  
      // Reset player unsubscribe functions
      unsubscribePlayers.current = [];
    };
  
    // Subscribe to changes in the gunGames collection
    unsubscribeGames = onSnapshot(collection(db, 'gunGames'), (snapshot) => {
      // Create an array to store player unsubscribe functions
      const playerUnsubscribeFunctions = [];
  
      // Process each game document in the snapshot
      const updatedGames = snapshot.docs.map(async (doc) => {
        const gameData = doc.data();
        const playersData = await getPlayersData(doc.ref);
        const isUserAlreadyInCurrentRoom = isUserInCurrentRoom(auth.currentUser.uid, { id: doc.id, ...gameData, players: playersData });
  
        // Subscribe to changes in the players collection for each game
        const playersUnsubscribe = onSnapshot(collection(doc.ref, 'players'), (playersSnapshot) => {
          const updatedPlayers = playersSnapshot.docs.map((playerDoc) => ({
            id: playerDoc.id,
            ...playerDoc.data(),
            isUserAlreadyInCurrentRoom,
          }));
  
          // Update the state with the new player information
          setGames((prevGames) => {
            return prevGames.map((game) =>
              game.id === doc.id ? { ...game, players: updatedPlayers } : game
            );
          });
        });
  
        // Save the player unsubscribe function for cleanup
        playerUnsubscribeFunctions.push(playersUnsubscribe);
  
        return {
          id: doc.id,
          ...gameData,
          players: playersData,
        };
      });
  
      // Wait for all games to be processed and update the state
      Promise.all(updatedGames).then((gamesWithPlayers) => {
        setGames(gamesWithPlayers);
      });
  
      // Clean up player subscriptions when the games change
      cleanupPlayerSubscriptions();
  
      // Update the player unsubscribe functions with the new ones
      unsubscribePlayers.current = playerUnsubscribeFunctions;
    });
  
    // Clean up game unsubscribe function when the component is unmounted
    return () => {
      if (unsubscribeGames) {
        unsubscribeGames();
      }
  
      // Clean up player subscriptions when the component is unmounted
      cleanupPlayerSubscriptions();
    };
  }, []); 


  const getPlayersData = async (gameRef) => {
    const playersSnapshot = await getDocs(collection(gameRef, 'players'));
    return playersSnapshot.docs.map((playerDoc) => ({ id: playerDoc.id, ...playerDoc.data() }));
  };
  
 

  const handleJoinOrReady = async (gameId) => {
    if (isJoining) {
      return;
    }
  
    setIsJoining(true);
  
    const currentUser = auth.currentUser;
  
    if (currentUser) {
      const userId = currentUser.uid;
  
      try {
        const gameDocRef = doc(db, 'gunGames', gameId);
        const gameSnapshot = await getDoc(gameDocRef);
  
        if (!gameSnapshot.exists()) {
          console.log('Game not found.');
          return;
        }
  
        const selectedGame = { id: gameSnapshot.id, ...gameSnapshot.data() };
  
        console.log('Selected Game:', selectedGame);
  
        if (!selectedGame.isGameStarted && selectedGame.players.length < 2) {
          const isUserAlreadyInGame = selectedGame.players.some((player) => player.userId === userId);
  
          console.log('Is User Already In Game:', isUserAlreadyInGame);
  
          if (!isUserAlreadyInGame) {
            // Remove player from the previous room if any
            const previousRoom = findPlayerRoom(userId);
            if (previousRoom) {
              await removePlayerFromPreviousRoom(userId, previousRoom.id);
            }
            // Get the current player order
            let currentPlayerOrder;
            const playersCollectionRef = collection(db, 'gunGames', selectedGame.id, 'players');
            
            // Check if there are other players in the room
            if (selectedGame.players.length === 1) {
              console.log("플레이어수", selectedGame.players)
              currentPlayerOrder = 2
              console.log("player 2명"); // Set playerOrder to 2 if other players are in the room
            } else {
              console.log("플레이어수", selectedGame)
              currentPlayerOrder = 1;
              console.log("player 1명")
            }
  
            const displayName = currentUser.displayName;
            const newPlayer = {
              userId,
              displayName: displayName ? displayName : `Player ${selectedGame.players.length + 1}`,
              isGamePlayer: true,
              joinedAt: serverTimestamp(),
              isReady: false,
              playerOrder: currentPlayerOrder,
            };
  
            console.log('New Player:', newPlayer);
  
            // Update the local state with the new player information
            setGames((prevGames) => {
              return prevGames.map((game) =>
                game.id === selectedGame.id ? { ...game, players: [...game.players, newPlayer] } : game
              );
            });
  
            // Check if the user is already in the current room
            const isUserInCurrentRoom = selectedGame.players.some((player) => player.userId === userId);
  
            if (!isUserInCurrentRoom) {
              const playersCollectionRef = collection(db, 'gunGames', selectedGame.id, 'players');
  
              await addDoc(playersCollectionRef, newPlayer);
  
              console.log('Player added to the current room.');
            } else {
              alert('이미 게임에 참가한 유저입니다!');
            }
  
            setIsJoining(false);
  
            // Check if the game can be started
            if (selectedGame.players.length === 2 && selectedGame.players.every((player) => player.isReady)) {
              // Start the game if conditions are met
              await db.collection('gunGames').doc(gameId).update({
                isGameStarted: true,
              });
  
              setGames((prevGames) => prevGames.filter((game) => game.id !== gameId));
              navigate(`/gameplay/${gameId}`);
            }
  
            return true;
          } else {
            alert('이미 게임에 참가한 유저입니다!');
          }
        } else {
          alert('게임이 이미 시작되었거나 플레이어가 꽉 찼습니다.');
          // If the game conditions are not met, delete the room
          await deleteDoc(gameDocRef);
        }
      } catch (error) {
        console.error('Error fetching or updating game information:', error.message);
      } finally {
        setIsJoining(false);
      }
    } else {
      console.error('No authenticated user.');
      setIsJoining(false);
    }
  };
  
  const handleStartGame = async (gameId) => {
    try {
      const selectedGame = games.find((game) => game.id === gameId);
  
      if (selectedGame && selectedGame.players.length === 2 && selectedGame.players.every((player) => player.isReady)) {
        // Update the game document in Firestore
        await updateDoc(doc(db, 'gunGames', gameId), {
          isGameStarted: true,
        });
  
        // Remove the game from the local state
        setGames((prevGames) => prevGames.filter((game) => game.id !== gameId));
  
        // Navigate to the gameplay page for the current game
        navigate(`/gameplay/${gameId}`);
      } else {
        alert('플레이어가 부족하거나 아직 모두 준비하지 않았습니다.');
      }
    } catch (error) {
      console.error('Error starting the game:', error.message);
    }
  };

  useEffect(() => {
    // Check if all players are ready in the current game
    const isAllPlayersReady = games.every((game) => game.players.length === 2 && game.players.every((player) => player.isReady));
  
    if (isAllPlayersReady) {
      // Get the ID of the first game where all players are ready
      const gameId = games.find((game) => game.players.length === 2 && game.players.every((player) => player.isReady))?.id;
  
      if (gameId) {
        // Update the game document in Firestore
        updateDoc(doc(db, 'gunGames', gameId), {
          isGameStarted: true,
        });
  
        // Remove the game from the local state
        setGames((prevGames) => prevGames.filter((game) => game.id !== gameId));
  
        // Navigate to the gameplay page for the current game
        navigate(`/gameplay/${gameId}`);
      }
    }
  }, [games]);

  const removePlayerFromPreviousRoom = async (userId, previousRoomId) => {
    console.log("이전방에서 플레이어를 제거하려고 시도중", userId);
    try {
      // Find the room the player is currently in
      const currentRoom = games.find((game) => game.players.some((player) => player.userId === userId));
      
      if (currentRoom && currentRoom.id === previousRoomId) {
        const updatedPlayers = currentRoom.players.filter((player) => player.userId !== userId);
  
        // Update the local state
        setGames((prevGames) => {
          return prevGames.map((game) => {
            if (game.id === currentRoom.id) {
              return { ...game, players: updatedPlayers };
            }
            return game;
          });
        });
  
        console.log('Firestore에서 플레이어를 제거하려고 시도 중:', userId, currentRoom.id, updatedPlayers);
  
        // Construct a reference to the player document in Firestore
        const playerCollectionRef = collection(db, 'gunGames', currentRoom.id, 'players');
        const playerQuery = query(playerCollectionRef, where('userId', '==', userId));
        const playerQuerySnapshot = await getDocs(playerQuery);
  
        if (!playerQuerySnapshot.empty) {
          // 쿼리 결과에서 가져온 문서에 대한 참조
          const playerDocRef = doc(db, 'gunGames', currentRoom.id, 'players', playerQuerySnapshot.docs[0].id);
  
          // Retrieve the player document
          const playerDocSnapshot = await getDoc(playerDocRef);
  
          // Check if the player document exists
          if (playerDocSnapshot.exists()) {
            // Delete the player document from Firestore
            await deleteDoc(playerDocRef);
            console.log('Player successfully removed from Firestore.');
          } else {
            console.log('Player not found in Firestore.');
          }
  
          // If there are no players left, delete the room
          if (updatedPlayers.length === 0) {
            const roomDocRef = doc(db, 'gunGames', currentRoom.id);
            await deleteDoc(roomDocRef);
            console.log('Room successfully removed from Firestore.');
          }
        } else {
          console.log('Player not found in the specified room.');
        }
      } else {
        console.log('Player not found in the specified room.');
      }
    } catch (error) {
      console.error('Error removing player from previous room:', error.message);
    }
  };
  
  
  
  

  
  const handleCreateRoom = async () => {
    const currentUser = auth.currentUser;
  
    if (currentUser) {
      const userId = currentUser.uid;
  
      // Remove player from the previous room if any
      const previousRoom = findPlayerRoom(userId);
      if (previousRoom) {
        console.log("기존방:", previousRoom)
        await removePlayerFromPreviousRoom(userId, previousRoom.id);
      }
  
      const newGame = {
        players: [],
        isGameStarted: false,
      };
  
      try {
        const docRef = await addDoc(collection(db, 'gunGames'), newGame);
        setCreatedRoomId(docRef.id);
      } catch (error) {
        console.error('Error creating a new game room:', error.message);
      }
    } else {
      console.error('No authenticated user.');
    };
}
  
  // Helper function to find the room a player is in
  const findPlayerRoom = (userId) => {
    return games.find((game) => game.players.some((player) => player.userId === userId));
  };
  


  useEffect(() => {
    if (createdRoomId) {
      handleJoinOrReady(createdRoomId);
      setCreatedRoomId(null);
    }
  }, [createdRoomId]);

  const handleReady = async (gameId, isReady) => {
    const currentUser = auth.currentUser;

    if (currentUser) {
      const userId = currentUser.uid;

      try {
        const playerQuerySnapshot = await getDocs(
          query(collection(db, 'gunGames', gameId, 'players'), where('userId', '==', userId))
        );

        if (!playerQuerySnapshot.empty) {
          const playerDoc = playerQuerySnapshot.docs[0];
          const playerData = playerDoc.data();

          // Update the player's 'isReady' field
          await updateDoc(playerDoc.ref, {
            isReady: isReady,
          });

          // Update the local state
          setGames((prevGames) =>
            prevGames.map((game) =>
              game.id === gameId
                ? {
                    ...game,
                    players: game.players.map((player) =>
                      player.userId === userId ? { ...player, isReady: isReady } : player
                    ),
                  }
                : game
            )
          );

          // Check if all players are ready
          const gameDocRef = doc(db, 'gunGames', gameId);
          const gameSnapshot = await getDoc(gameDocRef);
          const selectedGame = { id: gameSnapshot.id, ...gameSnapshot.data() };

          if (selectedGame.players.length === 2 && selectedGame.players.every((player) => player.isReady)) {
            await updateDoc(gameDocRef, {
              isGameStarted: true,
            });

            setGames((prevGames) => prevGames.filter((game) => game.id !== gameId));

            // Automatically navigate to the game page
            navigate(`/gameplay/${gameId}`);
          }
        } else {
          console.log('Player not found in the specified game.');
        }
      } catch (error) {
        console.error('Error updating player ready state:', error.message);
      }
    } else {
      console.error('No authenticated user.');
    }
  };
  
  
  

  return (
    <div>
      <h1>Game</h1>
      <button onClick={handleCreateRoom}>방 만들기</button>
      {games.map((game) => (
        <div key={game.id} className='m-3 space-y-3 border-2'>
          <h2>{`방 코드 :  ${game.id.slice(-4)} `}</h2>
          <p>플레이어 수: {game.players.length} / 2</p>
          {game.players.map((player) => (
  <div key={`${game.id}-${player.userId}`}>
    Player - 닉네임: {player.displayName}
    {player.isGamePlayer && (
      <>
        <span>
          {player.isReady ? ' | (준비 완료)' : ' | (준비해주세요)'}
        </span>
        <div>
          {!player.isReady && !game.isUserAlreadyInCurrentRoom && (
            // Check if the user is not already in the room
            !game.players.some((p) => p.userId === auth.currentUser.uid) && (
              <button
                onClick={() => handleJoinOrReady(game.id)}
                disabled={game.isGameStarted || game.players.length === 2 || player.isReady}
                className='px-1 mt-3 text-white bg-green-600'
              >
                참가하기
              </button>
            )
          )}
          {player.isGamePlayer && !player.isReady && (
            <button
               onClick={() => handleReady(game.id, true)}
              disabled={game.isGameStarted || game.players.length !== 2}
              className='px-1 mt-3 text-white bg-blue-600'
            >
              Ready
            </button>
          )}
          {player.isGamePlayer && player.isReady && (
            <button
              onClick={() => handleReady(game.id, false)}
              disabled={game.isGameStarted || game.players.length !== 2}
              className='px-1 mt-3 text-white bg-yellow-600'
            >
              준비취소
            </button>
          )}
        </div>
      </>
    )}
  </div>
))}

          <button
            onClick={() => handleStartGame(game.id)}
            disabled={
              game.isGameStarted ||
              game.players.length !== 2 ||
              !game.players.every((player) => player.isReady)
            }
          >
            게임 시작
          </button>
        </div>
      ))}
    </div>
  );
};

export default Gun;
import { useState } from 'react';
import GameBoard from './components/GameBoard';
import GameControls from './components/GameControls';
import './App.css';
import { GameMode, GameData, RoundData } from './types';

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameMode, setGameMode] = useState<GameMode>('sum');
  const [round, setRound] = useState(1);
  const [marbleCount, setMarbleCount] = useState(12); // Initial 12 marbles
  
  // Add game data state
  const [gameData, setGameData] = useState<GameData>({
    gameId: generateUniqueId(), 
    playerSessionId: getOrCreatePlayerSessionId(),
    gameMode: 'sum',
    startTime: 0,
    endTime: null,
    rounds: [],
    totalScore: 0
  });

  // Helper function to generate unique IDs
  function generateUniqueId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
  
  // Helper function to get or create player session ID
  function getOrCreatePlayerSessionId(): string {
    const storedId = localStorage.getItem('playerSessionId');
    if (storedId) return storedId;
    
    const newId = generateUniqueId();
    localStorage.setItem('playerSessionId', newId);
    return newId;
  }

  const startGame = (mode: GameMode) => {
    setGameMode(mode);
    setGameStarted(true);
    setRound(1);
    setMarbleCount(12);
    
    // Initialize game data
    setGameData({
      gameId: generateUniqueId(),
      playerSessionId: getOrCreatePlayerSessionId(),
      gameMode: mode,
      startTime: Date.now(),
      endTime: null,
      rounds: [],
      totalScore: 0
    });
  };

  const advanceRound = (roundData: RoundData) => {
    // Add the completed round data to our game data
    setGameData(prevData => ({
      ...prevData,
      rounds: [...prevData.rounds, roundData],
      totalScore: prevData.totalScore + 1 // Add a point for the win
    }));
    
    // Advance to the next round
    setRound(round + 1);
    setMarbleCount(marbleCount + 6); // Add 6 more marbles each round
  };

  const resetGame = (roundData: RoundData) => {
    // Add the failed round data to our game data
    const updatedGameData = {
      ...gameData,
      rounds: [...gameData.rounds, roundData],
      endTime: Date.now()
    };
    
    // Set the updated game data
    setGameData(updatedGameData);
    
    // Submit the data to your backend or log it
    submitGameData(updatedGameData);
    
    // Reset the game
    setGameStarted(false);
    setRound(1);
  };
  
  // Function to submit data (you would implement this)
  const submitGameData = (data: GameData) => {
    // For now, log to console
    console.log("Game Data:", data);
    
    // In a real implementation, you would send to your backend:
    // fetch('your-api-endpoint', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(data),
    // });
    
    // You can also save to localStorage for now
    try {
      const previousGames = JSON.parse(localStorage.getItem('freeSetGames') || '[]');
      localStorage.setItem('freeSetGames', JSON.stringify([...previousGames, data]));
    } catch (e) {
      console.error("Failed to save game data to localStorage", e);
    }
  };

  return (
    <div className="app">
      <h1>Free Sets</h1>
      
      {!gameStarted ? (
        <div className="game-setup">
          <h2>Select Game Mode</h2>
          <button onClick={() => startGame('sum')}>Sum Free Set</button>
          <button onClick={() => startGame('outerDist')}>Outer Distribution</button>
          <button onClick={() => startGame('innerDist')}>Inner Distribution</button>
        </div>
      ) : (
        <>
          <div className="game-info">
            <h2>Round: {round}</h2>
            <h3>Mode: {gameMode === 'sum' ? 'Sum Free Set' : 
                        gameMode === 'outerDist' ? 'Outer Distribution' : 
                        'Inner Distribution'}</h3>
            <h3>Marbles: {marbleCount}</h3>
            <h3>Score: {gameData.totalScore}</h3>
          </div>
          
          <GameBoard 
            marbleCount={marbleCount} 
            partitionCount={round + 1} 
            gameMode={gameMode}
            onWin={advanceRound}
            onLose={resetGame}
            roundNumber={round}
          />
          
          <GameControls />
        </>
      )}
    </div>
  );
}

export default App;
// src/App.tsx
import { useState } from 'react';
import GameBoard from './components/GameBoard';
import GameControls from './components/GameControls';
import './App.css';

// Game modes
export type GameMode = 'sum' | 'outerDist' | 'innerDist';

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameMode, setGameMode] = useState<GameMode>('sum');
  const [round, setRound] = useState(1);
  const [marbleCount, setMarbleCount] = useState(12); // Initial 12 marbles

  const startGame = (mode: GameMode) => {
    setGameMode(mode);
    setGameStarted(true);
    setRound(1);
    setMarbleCount(12);
  };

  const advanceRound = () => {
    setRound(round + 1);
    setMarbleCount(marbleCount + 6); // Add 6 more marbles each round
  };

  const resetGame = () => {
    setGameStarted(false);
    setRound(1);
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
          </div>
          
          <GameBoard 
            marbleCount={marbleCount} 
            partitionCount={round + 1} 
            gameMode={gameMode}
            onWin={advanceRound}
            onLose={resetGame}
          />
          
          <GameControls />
        </>
      )}
    </div>
  );
}

export default App;
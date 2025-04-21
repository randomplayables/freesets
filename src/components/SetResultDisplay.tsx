import { useEffect, useState } from 'react';
import { GameMode } from '../App';
import '../styles/SetResultDisplay.css';

interface SetResultDisplayProps {
  marbleCounts: number[];
  gameMode: GameMode;
  onContinue: () => void;
  onReset: () => void;
  isWinner: boolean;
}

const SetResultDisplay = ({ 
  marbleCounts, 
  gameMode, 
  onContinue, 
  onReset,
  isWinner 
}: SetResultDisplayProps) => {
  const [operationSet, setOperationSet] = useState<number[]>([]);
  const [overlappingElements, setOverlappingElements] = useState<number[]>([]);

  useEffect(() => {
    // Calculate the operation set based on the game mode
    const newOperationSet: number[] = [];
    const overlapping: number[] = [];

    if (gameMode === 'sum') {
      // Calculate all sums of pairs
      for (let i = 0; i < marbleCounts.length; i++) {
        for (let j = i; j < marbleCounts.length; j++) {
          const sum = marbleCounts[i] + marbleCounts[j];
          newOperationSet.push(sum);
          
          // Check for overlaps
          if (marbleCounts.includes(sum)) {
            overlapping.push(sum);
          }
        }
      }
    } else if (gameMode === 'outerDist') {
      // Calculate all rpois(a) + rpois(b) for each pair
      for (let i = 0; i < marbleCounts.length; i++) {
        for (let j = i; j < marbleCounts.length; j++) {
          const poisA = poissonRandom(marbleCounts[i]);
          const poisB = poissonRandom(marbleCounts[j]);
          const sum = poisA + poisB;
          
          newOperationSet.push(sum);
          
          // Check for overlaps
          if (marbleCounts.includes(sum)) {
            overlapping.push(sum);
          }
        }
      }
    } else if (gameMode === 'innerDist') {
      // Calculate all rpois(a + b) for each pair
      for (let i = 0; i < marbleCounts.length; i++) {
        for (let j = i; j < marbleCounts.length; j++) {
          const innerSum = poissonRandom(marbleCounts[i] + marbleCounts[j]);
          
          newOperationSet.push(innerSum);
          
          // Check for overlaps
          if (marbleCounts.includes(innerSum)) {
            overlapping.push(innerSum);
          }
        }
      }
    }

    // Remove duplicates from operation set
    setOperationSet([...new Set(newOperationSet)].sort((a, b) => a - b));
    setOverlappingElements([...new Set(overlapping)]);
  }, [marbleCounts, gameMode]);

  // Helper function to generate random Poisson distributed number
  const poissonRandom = (lambda: number) => {
    if (lambda <= 0) return 0;
    
    let L = Math.exp(-lambda);
    let p = 1.0;
    let k = 0;
    
    do {
      k++;
      p *= Math.random();
    } while (p > L);
    
    return k - 1;
  };

  // Get the operation name based on game mode
  const getOperationName = () => {
    switch (gameMode) {
      case 'sum':
        return 'S + S';
      case 'outerDist':
        return 'rpois(a) + rpois(b) for all a,b in S';
      case 'innerDist':
        return 'rpois(a + b) for all a,b in S';
      default:
        return 'S * S';
    }
  };

  return (
    <div className="set-result-display">
      <h2 className={isWinner ? "winner-title" : "loser-title"}>
        {isWinner ? "You Won!" : "You Lost!"}
      </h2>
      
      <div className="sets-container">
        <div className="set-box">
          <h3>Set S (Your Marble Counts)</h3>
          <div className="set-elements">
            {marbleCounts.sort((a, b) => a - b).map((count, idx) => (
              <span 
                key={idx} 
                className={overlappingElements.includes(count) ? "element overlapping" : "element"}
              >
                {count}
              </span>
            ))}
          </div>
        </div>

        <div className="set-box">
          <h3>{getOperationName()}</h3>
          <div className="set-elements">
            {operationSet.map((value, idx) => (
              <span 
                key={idx} 
                className={overlappingElements.includes(value) ? "element overlapping" : "element"}
              >
                {value}
              </span>
            ))}
          </div>
        </div>
      </div>

      {!isWinner && overlappingElements.length > 0 && (
        <div className="explanation">
          <p>
            Your set is not a valid {gameMode === 'sum' ? 'sum-free set' : 
                                    gameMode === 'outerDist' ? 'outer distribution-free set' : 
                                    'inner distribution-free set'} because the 
            following elements appear in both sets: {overlappingElements.join(', ')}
          </p>
        </div>
      )}

      <div className="result-buttons">
        {isWinner ? (
          <button className="continue-button" onClick={onContinue}>Continue to Next Round</button>
        ) : (
          <button className="reset-button" onClick={onReset}>Try Again</button>
        )}
      </div>
    </div>
  );
};

export default SetResultDisplay;
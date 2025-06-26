import { GameMode } from '../types';
import '../styles/SetResultDisplay.css';

interface SetResultDisplayProps {
  marbleCounts: number[];
  gameMode: GameMode;
  onContinue: () => void;
  onReset: () => void;
  isWinner: boolean;
  operationSet: number[];
  overlappingElements: number[];
  failingPairs?: { a: number, b: number }[];
}

const SetResultDisplay = ({ 
  marbleCounts, 
  gameMode, 
  onContinue, 
  onReset,
  isWinner,
  operationSet,
  overlappingElements,
  failingPairs
}: SetResultDisplayProps) => {
  // Get the operation name based on game mode
  const getOperationName = () => {
        switch (gameMode) {
          case 'sum':
            return 'S + S';
          case 'poisson':
            return 'rpois(a + b) for all a,b in S';
          case 'coprime':
            return 'gcd(a, b) for all a,b in S';
          default:
            return 'S + S';
      }
  };

  const getExplanationText = () => {
    switch (gameMode) {
      case 'sum':
        if (overlappingElements.length > 0) {
          return `Your set is not a valid sum-free set because the following elements appear in both sets: ${overlappingElements.join(', ')}`;
        }
        return '';
      case 'poisson':
        if (overlappingElements.length > 0) {
          return `Your set is not a valid Poisson distribution-free set because the following elements appear in both sets: ${overlappingElements.join(', ')}`;
        }
        return '';
      case 'coprime':
        if (failingPairs && failingPairs.length > 0) {
          const pairStrings = failingPairs.map(p => `gcd(${p.a}, ${p.b}) = 1`).join('; ');
          return `Your set is not coprime-free because at least one pair is coprime: ${pairStrings}`;
        }
        return 'A set is coprime-free if every pair of numbers in it shares a common factor greater than 1.';
      default:
        return '';
    }
  }

  return (
    <div className="set-result-display">
      <h2 className={isWinner ? "winner-title" : "loser-title"}>
        {isWinner ? "You Won!" : "You Lost!"}
      </h2>
      
      <div className="sets-container">
        <div className="set-box">
          <h3>S</h3>
          <div className="set-elements">
            {[...new Set(marbleCounts)].sort((a, b) => a - b).map((count, idx) => (
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

      {!isWinner && (
        <div className="explanation">
          <p>
            {getExplanationText()}
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
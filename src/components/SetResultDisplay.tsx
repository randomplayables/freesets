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
}

const SetResultDisplay = ({ 
  marbleCounts, 
  gameMode, 
  onContinue, 
  onReset,
  isWinner,
  operationSet,
  overlappingElements
}: SetResultDisplayProps) => {
  // Get the operation name based on game mode
  const getOperationName = () => {
        switch (gameMode) {
          case 'sum':
            return 'S + S';
          case 'poisson':
            return 'rpois(a + b) for all a,b in S';
          default:
            return 'S + S';
      }
  };

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

      {!isWinner && overlappingElements.length > 0 && (
        <div className="explanation">
          <p>
          Your set is not a valid {gameMode === 'sum' ? 'sum-free set' : 'Poisson distribution-free set'} because the 
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
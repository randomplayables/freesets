import { useState } from 'react';
import '../styles/GameControls.css';

const GameControls = () => {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  return (
    <div className="game-controls">
      <button onClick={() => setIsHelpOpen(!isHelpOpen)}>
        {isHelpOpen ? 'Close Help' : 'Show Help'}
      </button>
      
      {isHelpOpen && (
        <div className="help-content">
          <h3>How to Play Free Sets</h3>
          <ol>
            <li>Draw disjoint enclosures by clicking and dragging on the game board</li>
            <li>Each round requires one more enclosure than the previous round</li>
            <li>Once all enclosures are drawn, start the simulation</li>
            <li>Stop the simulation when you think the marbles are distributed in a way that meets the win condition</li>
            <li>Win conditions depend on the game mode:</li>
            <ul>
              <li><strong>Sum Free Set:</strong> The set of marble counts must not contain any sums of its own elements</li>
              <li><strong>Poisson:</strong> Uses rpois(a + b) for all a, b in S</li>
            </ul>
          </ol>
        </div>
      )}
    </div>
  );
};

export default GameControls;
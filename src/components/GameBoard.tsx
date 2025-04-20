import { useEffect, useRef, useState } from 'react';
import { GameMode } from '../App';
import '../styles/GameBoard.css';

interface Marble {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

interface Partition {
  id: number;
  points: { x: number; y: number }[];
  marbleCount: number;
}

interface GameBoardProps {
  marbleCount: number;
  partitionCount: number;
  gameMode: GameMode;
  onWin: () => void;
  onLose: () => void;
}

const GameBoard = ({ marbleCount, partitionCount, gameMode, onWin, onLose }: GameBoardProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [marbles, setMarbles] = useState<Marble[]>([]);
  const [partitions, setPartitions] = useState<Partition[]>([]);
  const [currentPartition, setCurrentPartition] = useState<number[][]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [gameState, setGameState] = useState<'drawing' | 'simulating' | 'checking'>('drawing');

  // Draw partitions and current drawing line during drawing phase
  useEffect(() => {
    if (gameState !== 'drawing' || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw existing partitions
    partitions.forEach(partition => {
      ctx.beginPath();
      const { x: startX, y: startY } = partition.points[0];
      ctx.moveTo(startX, startY);
      partition.points.forEach(pt => ctx.lineTo(pt.x, pt.y));
      ctx.closePath();
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Draw current partition in progress
    if (currentPartition.length > 0) {
      ctx.beginPath();
      const [firstX, firstY] = currentPartition[0];
      ctx.moveTo(firstX, firstY);
      currentPartition.forEach(([x, y]) => {
        ctx.lineTo(x, y);
      });
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.closePath();
    }
  }, [currentPartition, partitions, gameState]);

  // Initialize marbles whenever drawing phase starts or marble count changes
  useEffect(() => {
    if (gameState === 'drawing') {
      initializeMarbles();
      setPartitions([]);
    }
  }, [marbleCount, gameState]);

  // Animation loop for simulation
  useEffect(() => {
    let animationId: number;
    const animate = () => {
      if (!canvasRef.current || !isSimulating) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear and redraw
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawPartitions(ctx);
      updateMarbles();
      drawMarbles(ctx);

      animationId = requestAnimationFrame(animate);
    };

    if (isSimulating) {
      animationId = requestAnimationFrame(animate);
    }
    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [isSimulating, marbles, partitions]);

  const initializeMarbles = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const newMarbles: Marble[] = [];
    for (let i = 0; i < marbleCount; i++) {
      newMarbles.push({
        id: i,
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        radius: 10,
      });
    }
    setMarbles(newMarbles);
  };

  const updateMarbles = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    setMarbles(prev =>
      prev.map(m => {
        let newX = m.x + m.vx;
        let newY = m.y + m.vy;
        if (newX - m.radius <= 0 || newX + m.radius >= canvas.width) {
          m.vx *= -1;
          newX = m.x + m.vx;
        }
        if (newY - m.radius <= 0 || newY + m.radius >= canvas.height) {
          m.vy *= -1;
          newY = m.y + m.vy;
        }
        return { ...m, x: newX, y: newY };
      })
    );
  };

  const drawMarbles = (ctx: CanvasRenderingContext2D) => {
    marbles.forEach(m => {
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'blue';
      ctx.fill();
      ctx.closePath();
    });
  };

  const drawPartitions = (ctx: CanvasRenderingContext2D) => {
    partitions.forEach(partition => {
      ctx.beginPath();
      const first = partition.points[0];
      ctx.moveTo(first.x, first.y);
      partition.points.forEach(pt => ctx.lineTo(pt.x, pt.y));
      ctx.closePath();
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  };

  // Mouse handlers and rest of code remain unchanged...

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameState !== 'drawing' || partitions.length >= partitionCount) return;
    setIsDrawing(true);
    const rect = canvasRef.current!.getBoundingClientRect();
    setCurrentPartition([[e.clientX - rect.left, e.clientY - rect.top]]);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    setCurrentPartition(prev => [...prev, [e.clientX - rect.left, e.clientY - rect.top]]);
  };

  const handleMouseUp = () => {
    if (isDrawing && currentPartition.length > 2) {
      const points = currentPartition.map(([x, y]) => ({ x, y }));
      setPartitions(prev => [...prev, { id: prev.length, points, marbleCount: 0 }]);
    }
    setIsDrawing(false);
    setCurrentPartition([]);
  };

  const startSimulation = () => {
    if (partitions.length < partitionCount) {
      alert(`Please draw ${partitionCount} partitions before starting simulation.`);
      return;
    }
    setIsSimulating(true);
    setGameState('simulating');
  };

  const stopSimulation = () => {
    setIsSimulating(false);
    setGameState('checking');
    checkGameResult();
  };

  const checkGameResult = () => {
    // Count marbles in each partition
    const updatedPartitions = countMarblesInPartitions();
    setPartitions(updatedPartitions);
    
    // Get the set of counts
    const marbleCounts = updatedPartitions.map(p => p.marbleCount);
    
    // Check if the player wins based on the game mode
    const isWinner = checkWinCondition(marbleCounts);
    
    if (isWinner) {
      alert(`Congratulations! You won round ${partitionCount - 1}!`);
      onWin();
      setGameState('drawing');
    } else {
      alert(`Sorry, you lost round ${partitionCount - 1}. Try again!`);
      onLose();
    }
  };

  const countMarblesInPartitions = () => {
    return partitions.map(partition => {
      // Count marbles inside this partition
      const count = marbles.filter(marble => isPointInPolygon(marble.x, marble.y, partition.points)).length;
      
      return {
        ...partition,
        marbleCount: count
      };
    });
  };

  const isPointInPolygon = (x: number, y: number, polygon: { x: number; y: number }[]) => {
    let inside = false;
    
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].x;
      const yi = polygon[i].y;
      const xj = polygon[j].x;
      const yj = polygon[j].y;
      
      const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      
      if (intersect) inside = !inside;
    }
    
    return inside;
  };

  const checkWinCondition = (marbleCounts: number[]) => {
    switch (gameMode) {
      case 'sum':
        return checkSumFreeSet(marbleCounts);
      case 'outerDist':
        return checkOuterDistribution(marbleCounts);
      case 'innerDist':
        return checkInnerDistribution(marbleCounts);
      default:
        return false;
    }
  };

  const checkSumFreeSet = (set: number[]) => {
    // Check if S + S has no overlap with S
    const sumPairs = new Set<number>();
    
    // Generate all possible sums of pairs
    for (let i = 0; i < set.length; i++) {
      for (let j = i; j < set.length; j++) {
        sumPairs.add(set[i] + set[j]);
      }
    }
    
    // Check if any sum is in the original set
    for (const sum of sumPairs) {
      if (set.includes(sum)) {
        return false;
      }
    }
    
    return true;
  };

  const checkOuterDistribution = (set: number[]) => {
    // Implementation of Outer Dist condition
    // Generate rpois(a) + rpois(b) for all pairs in the set
    const outerSums = new Set<number>();
    
    for (let i = 0; i < set.length; i++) {
      for (let j = i; j < set.length; j++) {
        const poisA = poissonRandom(set[i]);
        const poisB = poissonRandom(set[j]);
        outerSums.add(poisA + poisB);
      }
    }
    
    // Check if any sum is in the original set
    for (const sum of outerSums) {
      if (set.includes(sum)) {
        return false;
      }
    }
    
    return true;
  };

  const checkInnerDistribution = (set: number[]) => {
    // Implementation of Inner Dist condition
    // Generate rpois(a + b) for all pairs in the set
    const innerSums = new Set<number>();
    
    for (let i = 0; i < set.length; i++) {
      for (let j = i; j < set.length; j++) {
        innerSums.add(poissonRandom(set[i] + set[j]));
      }
    }
    
    // Check if any result is in the original set
    for (const sum of innerSums) {
      if (set.includes(sum)) {
        return false;
      }
    }
    
    return true;
  };

  // Helper function to generate random Poisson distributed number
  const poissonRandom = (lambda: number) => {
    let L = Math.exp(-lambda);
    let p = 1.0;
    let k = 0;
    
    do {
      k++;
      p *= Math.random();
    } while (p > L);
    
    return k - 1;
  };


  return (
    <div className="game-board-container">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="game-board"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      <div className="game-controls">
        {gameState === 'drawing' && (
          <div>
            <p>Draw {partitionCount} partitions (closed shapes) on the board.</p>
            <p>Partitions drawn: {partitions.length} / {partitionCount}</p>
            <button 
              onClick={startSimulation} 
              disabled={partitions.length < partitionCount}
            >
              Start Simulation
            </button>
          </div>
        )}
        
        {gameState === 'simulating' && (
          <button onClick={stopSimulation}>Stop Simulation</button>
        )}
        
        {partitions.length > 0 && gameState === 'checking' && (
          <div className="partition-info">
            <h3>Marble counts in each partition:</h3>
            <ul>
              {partitions.map(partition => (
                <li key={partition.id}>
                  Partition {partition.id + 1}: {partition.marbleCount} marbles
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameBoard;

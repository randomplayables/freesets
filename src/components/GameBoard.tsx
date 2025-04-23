import { useEffect, useRef, useState } from 'react';
import SetResultDisplay from './SetResultDisplay';
import '../styles/GameBoard.css';
import { GameMode, Marble, Partition, MarbleData, PartitionData, RoundData } from '../types';

interface GameBoardProps {
  marbleCount: number;
  partitionCount: number;
  gameMode: GameMode;
  onWin: (roundData: RoundData) => void;
  onLose: (roundData: RoundData) => void;
  roundNumber: number;
}

const GameBoard = ({ marbleCount, partitionCount, gameMode, onWin, onLose, roundNumber }: GameBoardProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [marbles, setMarbles] = useState<Marble[]>([]);
  const [partitions, setPartitions] = useState<Partition[]>([]);
  const [currentPartition, setCurrentPartition] = useState<number[][]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [gameState, setGameState] = useState<'drawing' | 'simulating' | 'checking' | 'results'>('drawing');
  const [marbleCounts, setMarbleCounts] = useState<number[]>([]);
  const [isWinner, setIsWinner] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Data collection state
  const [roundStartTime] = useState<number>(Date.now());
  const [simStartTime, setSimStartTime] = useState<number>(0);
  const [simEndTime, setSimEndTime] = useState<number>(0);
  const [drawTimes, setDrawTimes] = useState<number[]>([]);
  const [marbleData, setMarbleData] = useState<MarbleData[]>([]);
  const [attempts, setAttempts] = useState<number>(1);
  const [operationSet, setOperationSet] = useState<number[]>([]);
  const [overlappingElements, setOverlappingElements] = useState<number[]>([]);
  
  // Speed multiplier for marble movement
  const SPEED_MULTIPLIER = 10;
  
  // Ref for tracking initial marble positions
  const initialMarblePositions = useRef<{x: number, y: number}[]>([]);

  // Draw partitions and current drawing line during drawing phase
  useEffect(() => {
    if ((gameState !== 'drawing' && gameState !== 'results') || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw existing partitions
    partitions.forEach(partition => {
      ctx.beginPath();
      if (partition.points.length === 0) return;
      
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

    if (gameState === 'results') {
      // Draw the marbles in their final positions
      drawMarbles(ctx);
    }
  }, [currentPartition, partitions, gameState, marbles]);

  // Initialize marbles whenever drawing phase starts or marble count changes
  useEffect(() => {
    if (gameState === 'drawing') {
      initializeMarbles();
      setPartitions([]);
      setDrawTimes([]);
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
    const initialPositions: {x: number, y: number}[] = [];
    
    for (let i = 0; i < marbleCount; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      initialPositions.push({x, y});
      
      newMarbles.push({
        id: i,
        x,
        y,
        vx: (Math.random() - 0.5) * 2 * SPEED_MULTIPLIER,
        vy: (Math.random() - 0.5) * 2 * SPEED_MULTIPLIER,
        radius: 10,
      });
    }
    
    initialMarblePositions.current = initialPositions;
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
      if (partition.points.length === 0) return;
      
      const first = partition.points[0];
      ctx.moveTo(first.x, first.y);
      partition.points.forEach(pt => ctx.lineTo(pt.x, pt.y));
      ctx.closePath();
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  };

  // Calculate polygon area
  const calculatePolygonArea = (points: {x: number, y: number}[]): number => {
    let area = 0;
    const n = points.length;
    
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      area += points[i].x * points[j].y;
      area -= points[j].x * points[i].y;
    }
    
    return Math.abs(area) / 2;
  };
  
  // Calculate polygon perimeter
  const calculatePolygonPerimeter = (points: {x: number, y: number}[]): number => {
    let perimeter = 0;
    const n = points.length;
    
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      const dx = points[j].x - points[i].x;
      const dy = points[j].y - points[i].y;
      perimeter += Math.sqrt(dx * dx + dy * dy);
    }
    
    return perimeter;
  };

  // Check if line segments intersect
  const doLineSegmentsIntersect = (
    x1: number, y1: number, x2: number, y2: number,
    x3: number, y3: number, x4: number, y4: number
  ): boolean => {
    // Calculate the direction of the lines
    const d1x = x2 - x1;
    const d1y = y2 - y1;
    const d2x = x4 - x3;
    const d2y = y4 - y3;
    
    // Calculate the determinant
    const det = d1x * d2y - d1y * d2x;
    
    // If det is zero, lines are parallel or collinear
    if (det === 0) return false;
    
    // Calculate the parameters of the intersection point
    const s = ((x1 - x3) * d2y - (y1 - y3) * d2x) / det;
    const t = ((x3 - x1) * d1y - (y3 - y1) * d1x) / -det;
    
    // Check if the intersection point lies on both line segments
    return s >= 0 && s <= 1 && t >= 0 && t <= 1;
  };

  // Check if polygons overlap
  const doPolygonsOverlap = (polygon1: {x: number, y: number}[], polygon2: {x: number, y: number}[]): boolean => {
    // Check if any edge of polygon1 intersects with any edge of polygon2
    for (let i = 0; i < polygon1.length; i++) {
      const i2 = (i + 1) % polygon1.length;
      const p1 = polygon1[i];
      const p2 = polygon1[i2];
      
      for (let j = 0; j < polygon2.length; j++) {
        const j2 = (j + 1) % polygon2.length;
        const p3 = polygon2[j];
        const p4 = polygon2[j2];
        
        if (doLineSegmentsIntersect(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y, p4.x, p4.y)) {
          return true;
        }
      }
    }
    
    // Check if one polygon is completely inside the other
    // (we need to check at least one point from each polygon)
    if (isPointInPolygon(polygon1[0].x, polygon1[0].y, polygon2) || 
        isPointInPolygon(polygon2[0].x, polygon2[0].y, polygon1)) {
      return true;
    }
    
    return false;
  };

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
      const drawTime = Date.now();
      const area = calculatePolygonArea(points);
      const perimeter = calculatePolygonPerimeter(points);
      
      // Check for overlaps with existing partitions
      let hasOverlap = false;
      for (const partition of partitions) {
        if (doPolygonsOverlap(points, partition.points)) {
          hasOverlap = true;
          setErrorMessage("Shapes cannot overlap! Try drawing elsewhere.");
          setTimeout(() => setErrorMessage(null), 3000); // Clear error after 3 seconds
          break;
        }
      }
      
      if (!hasOverlap) {
        setPartitions(prev => [
          ...prev, 
          { 
            id: prev.length, 
            points, 
            marbleCount: 0,
            area,
            perimeter,
            drawTime
          }
        ]);
        
        setDrawTimes(prev => [...prev, drawTime]);
        setErrorMessage(null);
      }
    }
    setIsDrawing(false);
    setCurrentPartition([]);
  };

  const startSimulation = () => {
    if (partitions.length < partitionCount) {
      alert(`Please draw ${partitionCount} partitions before starting simulation.`);
      return;
    }
    
    const simStart = Date.now();
    setSimStartTime(simStart);
    setIsSimulating(true);
    setGameState('simulating');
    
    // Initialize marble data tracking
    const newMarbleData: MarbleData[] = marbles.map((marble, index) => {
      return {
        id: marble.id,
        startX: initialMarblePositions.current[index].x,
        startY: initialMarblePositions.current[index].y,
        endX: marble.x,
        endY: marble.y,
        startTime: simStart,
        endTime: 0,
        totalDistance: 0
      };
    });
    
    setMarbleData(newMarbleData);
  };

  const stopSimulation = () => {
    const endTime = Date.now();
    setSimEndTime(endTime);
    setIsSimulating(false);
    
    // Update marble end positions and calculate distances
    const updatedMarbleData = marbleData.map((data, index) => {
      const marble = marbles[index];
      const dx = marble.x - data.startX;
      const dy = marble.y - data.startY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      return {
        ...data,
        endX: marble.x,
        endY: marble.y,
        endTime,
        totalDistance: distance
      };
    });
    
    setMarbleData(updatedMarbleData);
    setGameState('checking');
    checkGameResult();
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
    if (polygon.length < 3) return false;
    
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

  const checkGameResult = () => {
    // Count marbles in each partition
    const updatedPartitions = countMarblesInPartitions();
    setPartitions(updatedPartitions);
    
    // Get the set of counts
    const counts = updatedPartitions.map(p => p.marbleCount);
    setMarbleCounts(counts);
    
    // Check if the player wins based on the game mode
    const winner = checkWinCondition(counts);
    setIsWinner(winner);
    
    // Calculate operation sets for data collection
    let ops: number[] = [];
    let overlaps: number[] = [];
    
    if (gameMode === 'sum') {
      // Calculate all sums of pairs
      for (let i = 0; i < counts.length; i++) {
        for (let j = i; j < counts.length; j++) {
          const sum = counts[i] + counts[j];
          ops.push(sum);
          
          // Check for overlaps
          if (counts.includes(sum)) {
            overlaps.push(sum);
          }
        }
      }
    } else if (gameMode === 'outerDist') {
      // Calculate all rpois(a) + rpois(b) for each pair
      for (let i = 0; i < counts.length; i++) {
        for (let j = i; j < counts.length; j++) {
          const poisA = poissonRandom(counts[i]);
          const poisB = poissonRandom(counts[j]);
          const sum = poisA + poisB;
          
          ops.push(sum);
          
          // Check for overlaps
          if (counts.includes(sum)) {
            overlaps.push(sum);
          }
        }
      }
    } else if (gameMode === 'innerDist') {
      // Calculate all rpois(a + b) for each pair
      for (let i = 0; i < counts.length; i++) {
        for (let j = i; j < counts.length; j++) {
          const innerSum = poissonRandom(counts[i] + counts[j]);
          
          ops.push(innerSum);
          
          // Check for overlaps
          if (counts.includes(innerSum)) {
            overlaps.push(innerSum);
          }
        }
      }
    }
    
    // Remove duplicates
    setOperationSet([...new Set(ops)]);
    setOverlappingElements([...new Set(overlaps)]);
    
    // Update the game state to show results
    setGameState('results');
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
    // Get unique values in the set
    const uniqueSet = [...new Set(set)];
    const sumPairs = new Set<number>();
    
    // Generate all possible sums of pairs
    for (let i = 0; i < set.length; i++) {
      for (let j = i; j < set.length; j++) {
        sumPairs.add(set[i] + set[j]);
      }
    }
    
    // Check if any sum is in the unique set
    for (const sum of sumPairs) {
      if (uniqueSet.includes(sum)) {
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

  const handleContinue = () => {
    // Prepare round data for collection
    const roundData: RoundData = prepareRoundData();
    onWin(roundData);
    setGameState('drawing');
  };

  const handleReset = () => {
    // Prepare round data for collection
    const roundData: RoundData = prepareRoundData();
    onLose(roundData);
    setAttempts(prev => prev + 1);
    setGameState('drawing');
  };

  // Helper to prepare round data for collection
  const prepareRoundData = (): RoundData => {
    // Convert partitions to partition data format
    const partitionData: PartitionData[] = partitions.map((partition, index) => ({
      id: partition.id,
      vertices: partition.points,
      area: partition.area || calculatePolygonArea(partition.points),
      perimeter: partition.perimeter || calculatePolygonPerimeter(partition.points),
      drawTime: partition.drawTime || drawTimes[index] || 0,
      marbleCount: partition.marbleCount
    }));
    
    return {
      roundNumber,
      gameMode,
      marbleCount,
      partitionCount,
      startTime: roundStartTime,
      endTime: Date.now(),
      simStartTime,
      simEndTime,
      marbles: marbleData,
      partitions: partitionData,
      marbleCounts,
      operationSet,
      overlappingElements,
      isWinner,
      attempts
    };
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
      
      {errorMessage && (
        <div className="error-message">
          {errorMessage}
        </div>
      )}
      
      {gameState === 'results' ? (
        <SetResultDisplay
          marbleCounts={marbleCounts}
          gameMode={gameMode}
          onContinue={handleContinue}
          onReset={handleReset}
          isWinner={isWinner}
          operationSet={operationSet}
          overlappingElements={overlappingElements}
        />
      ) : (
        <div className="game-controls">
          {gameState === 'drawing' && (
            <div>
              <p>Draw {partitionCount} disjoint enclosures on the board.</p>
              <p>Enclosures drawn: {partitions.length} / {partitionCount}</p>
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
        </div>
      )}
    </div>
  );
};

export default GameBoard;
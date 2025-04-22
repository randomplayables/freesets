export type GameMode = 'sum' | 'outerDist' | 'innerDist';

export interface Marble {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

export interface Partition {
  id: number;
  points: { x: number; y: number }[];
  marbleCount: number;
  area?: number;
  perimeter?: number;
  drawTime?: number;
}

export interface MarbleData {
  id: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  startTime: number;
  endTime: number;
  totalDistance: number;
}

export interface PartitionData {
  id: number;
  vertices: { x: number; y: number }[];
  area: number;
  perimeter: number;
  drawTime: number;
  marbleCount: number;
}

export interface RoundData {
  roundNumber: number;
  gameMode: GameMode;
  marbleCount: number;
  partitionCount: number;
  startTime: number;
  endTime: number;
  simStartTime: number;
  simEndTime: number;
  marbles: MarbleData[];
  partitions: PartitionData[];
  marbleCounts: number[];
  operationSet: number[];
  overlappingElements: number[];
  isWinner: boolean;
  attempts: number;
}

export interface GameData {
  gameId: string;
  playerSessionId: string;
  gameMode: GameMode;
  startTime: number;
  endTime: number | null;
  rounds: RoundData[];
  totalScore: number;
}
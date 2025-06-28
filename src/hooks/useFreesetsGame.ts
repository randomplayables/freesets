import { useState, useCallback, useEffect } from 'react';
import { GameMode, RoundData } from '../types';
import { initGameSession, saveGameData } from '../services/apiService';

const useFreesetsGame = () => {
    const [gameStarted, setGameStarted] = useState(false);
    const [gameMode, setGameMode] = useState<GameMode>('sum');
    const [round, setRound] = useState(1);
    const [marbleCount, setMarbleCount] = useState(12);
    const [totalScore, setTotalScore] = useState(0);
    const [gameSession, setGameSession] = useState<any>(null);
    const [allRoundData, setAllRoundData] = useState<RoundData[]>([]);

    useEffect(() => {
        const initSession = async () => {
            const session = await initGameSession();
            setGameSession(session);
        };
        initSession();
    }, []);

    const startGame = useCallback((mode: GameMode) => {
        setGameMode(mode);
        setGameStarted(true);
        setRound(1);
        setMarbleCount(12);
        setTotalScore(0);
        setAllRoundData([]);
    }, []);

    const advanceRound = useCallback(async (roundData: RoundData) => {
        if (gameSession) {
            await saveGameData(round, roundData);
        }
        setAllRoundData(prev => [...prev, roundData]);
        setTotalScore(prev => prev + 1);
        setRound(prev => prev + 1);
        setMarbleCount(prev => prev + 6);
    }, [round, gameSession]);

    const endGame = useCallback(async (finalRoundData: RoundData) => {
        if (gameSession) {
            // Save the data for the final, losing round
            await saveGameData(round, finalRoundData);

            // Construct and save the final game summary data
            const finalGameData = {
                totalScore: totalScore,
                allRounds: [...allRoundData, finalRoundData],
                difficulty: gameMode,
                gameCompleted: true,
                finalRound: round
            };
            // Use round + 1 for the final summary to avoid collision
            await saveGameData(round + 1, finalGameData);
        }

        // Reset game state
        setGameStarted(false);
        setRound(1);
        setTotalScore(0);
        setMarbleCount(12);
        setAllRoundData([]);
    }, [round, totalScore, gameMode, allRoundData, gameSession]);

    return {
        gameStarted,
        gameMode,
        round,
        marbleCount,
        totalScore,
        startGame,
        advanceRound,
        endGame
    };
};

export default useFreesetsGame;
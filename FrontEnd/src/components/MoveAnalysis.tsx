import React, { useState, useEffect } from 'react';

interface MoveAnalysisData {
    move: string;
    classification: string;
    bestMove: string;
    scoreDiff: number;
}

interface GameAnalysisData {
    accuracy: number;
    blunders: number;
    mistakes: number;
    inaccuracies: number;
    excellent: number;
    good: number;
    moves: MoveAnalysisData[];
    totalMoves?: number;
    gameLength?: string;
}

interface MoveAnalysisProps {
    socket: WebSocket | null;
    isGameActive: boolean;
    setGameAnalysis: (data: GameAnalysisData) => void;
}

export const MoveAnalysis: React.FC<MoveAnalysisProps> = ({ socket, isGameActive, setGameAnalysis }) => {
    const [lastMoveAnalysis, setLastMoveAnalysis] = useState<MoveAnalysisData | null>(null);
    const [showAnalysis, setShowAnalysis] = useState(false);

    useEffect(() => {
        if (!socket) return;

        const handleMessage = (event: MessageEvent) => {
            const data = JSON.parse(event.data);
            if (data.type === 'move_analysis') {
                setLastMoveAnalysis(data.payload);
                setShowAnalysis(true);
                setTimeout(() => setShowAnalysis(false), 5000);
            }
            if (data.type === 'game_analysis') {
                setGameAnalysis(data.payload);
            }
        };

        socket.addEventListener('message', handleMessage);
        return () => socket.removeEventListener('message', handleMessage);
    }, [socket, setGameAnalysis]);

    const getClassificationColor = (classification: string) => {
        switch (classification) {
            case 'Excellent': return 'text-green-400 bg-green-400/20';
            case 'Good': return 'text-blue-400 bg-blue-400/20';
            case 'Inaccuracy': return 'text-yellow-400 bg-yellow-400/20';
            case 'Mistake': return 'text-orange-400 bg-orange-400/20';
            case 'Blunder': return 'text-red-400 bg-red-400/20';
            default: return 'text-slate-400 bg-slate-400/20';
        }
    };

    const getClassificationIcon = (classification: string) => {
        switch (classification) {
            case 'Excellent': return '🎯';
            case 'Good': return '👍';
            case 'Inaccuracy': return '⚠️';
            case 'Mistake': return '❌';
            case 'Blunder': return '💥';
            default: return '❓';
        }
    };

    return (
        <>
            {/* Live Move Analysis */}
            {showAnalysis && lastMoveAnalysis && isGameActive && (
                <div className="fixed top-4 right-4 bg-slate-800 rounded-lg border border-slate-700 shadow-2xl p-4 w-80 animate-slide-in-right">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-white font-semibold">Move Analysis</h3>
                        <button 
                            onClick={() => setShowAnalysis(false)}
                            className="text-slate-400 hover:text-white"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-slate-300">Your Move:</span>
                            <span className="font-mono text-emerald-400">{lastMoveAnalysis.move}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-slate-300">Rating:</span>
                            <span className={`px-2 py-1 rounded-full text-sm font-medium ${getClassificationColor(lastMoveAnalysis.classification)}`}>
                                {getClassificationIcon(lastMoveAnalysis.classification)} {lastMoveAnalysis.classification}
                            </span>
                        </div>
                        {lastMoveAnalysis.bestMove && lastMoveAnalysis.move !== lastMoveAnalysis.bestMove && (
                            <div className="flex items-center justify-between">
                                <span className="text-slate-300">Best Move:</span>
                                <span className="font-mono text-blue-400">{lastMoveAnalysis.bestMove}</span>
                            </div>
                        )}
                        {lastMoveAnalysis.scoreDiff !== 0 && (
                            <div className="flex items-center justify-between">
                                <span className="text-slate-300">Score Change:</span>
                                <span className={`font-semibold ${lastMoveAnalysis.scoreDiff > 0 ? 'text-green-400' : 'text-red-400'}`}>{lastMoveAnalysis.scoreDiff > 0 ? '+' : ''}{lastMoveAnalysis.scoreDiff}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};
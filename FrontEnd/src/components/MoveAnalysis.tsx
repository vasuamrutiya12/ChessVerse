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
}

interface MoveAnalysisProps {
    socket: WebSocket | null;
    isGameActive: boolean;
}

export const MoveAnalysis: React.FC<MoveAnalysisProps> = ({ socket, isGameActive }) => {
    const [lastMoveAnalysis, setLastMoveAnalysis] = useState<MoveAnalysisData | null>(null);
    const [gameAnalysis, setGameAnalysis] = useState<GameAnalysisData | null>(null);
    const [showAnalysis, setShowAnalysis] = useState(false);

    useEffect(() => {
        if (!socket) return;

        console.log('Setting up move analysis message listener');
        
        const handleMessage = (event: MessageEvent) => {
            const data = JSON.parse(event.data);
            console.log('Move analysis received message:', data);
            
            if (data.type === 'move_analysis') {
                console.log('Setting move analysis:', data.payload);
                setLastMoveAnalysis(data.payload);
                setShowAnalysis(true);
                // Auto-hide after 5 seconds
                setTimeout(() => setShowAnalysis(false), 5000);
            }
            
            if (data.type === 'game_analysis') {
                console.log('Setting game analysis:', data.payload);
                setGameAnalysis(data.payload);
            }
        };

        socket.addEventListener('message', handleMessage);
        return () => socket.removeEventListener('message', handleMessage);
    }, [socket]);

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
                                <span className={`font-semibold ${lastMoveAnalysis.scoreDiff > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {lastMoveAnalysis.scoreDiff > 0 ? '+' : ''}{lastMoveAnalysis.scoreDiff}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Post-Game Analysis */}
            {gameAnalysis && !isGameActive && (
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 mt-8">
                    <div className="flex items-center mb-6">
                        <div className="text-2xl mr-3">📊</div>
                        <h2 className="text-2xl font-bold text-white">Game Analysis</h2>
                    </div>

                    {/* Overall Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-slate-700/30 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-emerald-400">{gameAnalysis.accuracy.toFixed(1)}%</div>
                            <div className="text-slate-400 text-sm">Accuracy</div>
                        </div>
                        <div className="bg-slate-700/30 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-green-400">{gameAnalysis.excellent}</div>
                            <div className="text-slate-400 text-sm">Excellent</div>
                        </div>
                        <div className="bg-slate-700/30 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-blue-400">{gameAnalysis.good}</div>
                            <div className="text-slate-400 text-sm">Good</div>
                        </div>
                        <div className="bg-slate-700/30 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-yellow-400">{gameAnalysis.inaccuracies}</div>
                            <div className="text-slate-400 text-sm">Inaccuracies</div>
                        </div>
                        <div className="bg-slate-700/30 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-orange-400">{gameAnalysis.mistakes}</div>
                            <div className="text-slate-400 text-sm">Mistakes</div>
                        </div>
                        <div className="bg-slate-700/30 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-red-400">{gameAnalysis.blunders}</div>
                            <div className="text-slate-400 text-sm">Blunders</div>
                        </div>
                    </div>

                    {/* Accuracy Bar */}
                    <div className="bg-slate-700/30 rounded-lg p-4 mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-slate-300">Overall Accuracy</span>
                            <span className="text-emerald-400 font-semibold">{gameAnalysis.accuracy.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-slate-600 rounded-full h-3">
                            <div 
                                className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-3 rounded-full transition-all duration-1000"
                                style={{ width: `${Math.min(gameAnalysis.accuracy, 100)}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Move-by-Move Analysis */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Move Analysis</h3>
                        <div className="max-h-64 overflow-y-auto space-y-2">
                            {gameAnalysis.moves.map((move, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <span className="text-slate-400 font-mono">#{index + 1}</span>
                                        <span className="text-white font-mono">{move.move}</span>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getClassificationColor(move.classification)}`}>
                                        {getClassificationIcon(move.classification)} {move.classification}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
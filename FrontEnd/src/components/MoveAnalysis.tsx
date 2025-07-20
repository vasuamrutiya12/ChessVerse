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
    const [showGameAnalysis, setShowGameAnalysis] = useState(false);

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
                setShowGameAnalysis(true);
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
            {showGameAnalysis && gameAnalysis && !isGameActive && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
                    <div className="w-full max-w-4xl bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center">
                                    <div className="text-3xl mr-3">📊</div>
                                    <h2 className="text-3xl font-bold text-white">Post-Game Analysis</h2>
                                </div>
                                <button 
                                    onClick={() => setShowGameAnalysis(false)}
                                    className="text-slate-400 hover:text-white text-xl"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Game Summary */}
                            <div className="bg-slate-700/30 rounded-lg p-4 mb-6">
                                <h3 className="text-lg font-semibold text-white mb-2">Game Summary</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                    <div>
                                        <div className="text-2xl font-bold text-blue-400">{gameAnalysis.totalMoves || 'N/A'}</div>
                                        <div className="text-slate-400 text-sm">Total Moves</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-purple-400">{gameAnalysis.gameLength || 'N/A'}</div>
                                        <div className="text-slate-400 text-sm">Game Length</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-emerald-400">{gameAnalysis.accuracy.toFixed(1)}%</div>
                                        <div className="text-slate-400 text-sm">Accuracy</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-yellow-400">
                                            {gameAnalysis.excellent + gameAnalysis.good}
                                        </div>
                                        <div className="text-slate-400 text-sm">Good Moves</div>
                                    </div>
                                </div>
                            </div>

                            {/* Overall Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                                <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-green-400">{gameAnalysis.excellent}</div>
                                    <div className="text-green-300 text-sm">Excellent</div>
                                    <div className="text-xs text-slate-400 mt-1">🎯 Perfect moves</div>
                                </div>
                                <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-blue-400">{gameAnalysis.good}</div>
                                    <div className="text-blue-300 text-sm">Good</div>
                                    <div className="text-xs text-slate-400 mt-1">👍 Strong moves</div>
                                </div>
                                <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-yellow-400">{gameAnalysis.inaccuracies}</div>
                                    <div className="text-yellow-300 text-sm">Inaccuracies</div>
                                    <div className="text-xs text-slate-400 mt-1">⚠️ Minor errors</div>
                                </div>
                                <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-orange-400">{gameAnalysis.mistakes}</div>
                                    <div className="text-orange-300 text-sm">Mistakes</div>
                                    <div className="text-xs text-slate-400 mt-1">❌ Clear errors</div>
                                </div>
                                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-red-400">{gameAnalysis.blunders}</div>
                                    <div className="text-red-300 text-sm">Blunders</div>
                                    <div className="text-xs text-slate-400 mt-1">💥 Major errors</div>
                                </div>
                                <div className="bg-slate-500/20 border border-slate-500/30 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-slate-400">
                                        {((gameAnalysis.excellent + gameAnalysis.good) / (gameAnalysis.totalMoves || 1) * 100).toFixed(0)}%
                                    </div>
                                    <div className="text-slate-300 text-sm">Quality Rate</div>
                                    <div className="text-xs text-slate-400 mt-1">📈 Good moves %</div>
                                </div>
                            </div>

                            {/* Accuracy Bar */}
                            <div className="bg-slate-700/30 rounded-lg p-4 mb-6">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-slate-300 font-medium">Overall Performance</span>
                                    <span className="text-emerald-400 font-bold text-lg">{gameAnalysis.accuracy.toFixed(1)}%</span>
                                </div>
                                <div className="w-full bg-slate-600 rounded-full h-4">
                                    <div 
                                        className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-4 rounded-full transition-all duration-1000 relative"
                                        style={{ width: `${Math.min(gameAnalysis.accuracy, 100)}%` }}
                                    >
                                        <div className="absolute right-2 top-0 h-full flex items-center">
                                            <span className="text-white text-xs font-bold">
                                                {gameAnalysis.accuracy > 15 ? `${gameAnalysis.accuracy.toFixed(0)}%` : ''}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-between text-xs text-slate-400 mt-2">
                                    <span>Beginner</span>
                                    <span>Intermediate</span>
                                    <span>Advanced</span>
                                    <span>Master</span>
                                </div>
                            </div>

                            {/* Move-by-Move Analysis */}
                            <div>
                                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                                    <span className="mr-2">🔍</span>
                                    Move-by-Move Analysis
                                </h3>
                                <div className="max-h-64 overflow-y-auto space-y-2 bg-slate-700/20 rounded-lg p-4">
                                    {gameAnalysis.moves && gameAnalysis.moves.length > 0 ? (
                                        gameAnalysis.moves.map((move, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors">
                                                <div className="flex items-center space-x-4">
                                                    <span className="text-slate-400 font-mono text-sm bg-slate-600 px-2 py-1 rounded">
                                                        #{index + 1}
                                                    </span>
                                                    <span className="text-white font-mono font-bold">{move.move}</span>
                                                    {move.bestMove && move.move !== move.bestMove && (
                                                        <span className="text-blue-400 font-mono text-sm">
                                                            Best: {move.bestMove}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    {move.scoreDiff !== 0 && (
                                                        <span className={`text-sm font-semibold ${
                                                            move.scoreDiff > 0 ? 'text-green-400' : 'text-red-400'
                                                        }`}>
                                                            {move.scoreDiff > 0 ? '+' : ''}{move.scoreDiff}
                                                        </span>
                                                    )}
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getClassificationColor(move.classification)}`}>
                                                        {getClassificationIcon(move.classification)} {move.classification}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-slate-400">
                                            <div className="text-4xl mb-2">🤔</div>
                                            <div>No detailed move analysis available</div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Close Button */}
                            <div className="mt-6 text-center">
                                <button
                                    onClick={() => setShowGameAnalysis(false)}
                                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                                >
                                    Close Analysis
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

// Helper function for classification colors (if not already defined)
function getClassificationColor(classification: string): string {
    switch (classification) {
        case 'Excellent': return 'text-green-400 bg-green-400/20 border border-green-400/30';
        case 'Good': return 'text-blue-400 bg-blue-400/20 border border-blue-400/30';
        case 'Inaccuracy': return 'text-yellow-400 bg-yellow-400/20 border border-yellow-400/30';
        case 'Mistake': return 'text-orange-400 bg-orange-400/20 border border-orange-400/30';
        case 'Blunder': return 'text-red-400 bg-red-400/20 border border-red-400/30';
        default: return 'text-slate-400 bg-slate-400/20 border border-slate-400/30';
    }
}

function getClassificationIcon(classification: string): string {
    switch (classification) {
        case 'Excellent': return '🎯';
        case 'Good': return '👍';
        case 'Inaccuracy': return '⚠️';
        case 'Mistake': return '❌';
        case 'Blunder': return '💥';
        default: return '❓';
    }
}
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
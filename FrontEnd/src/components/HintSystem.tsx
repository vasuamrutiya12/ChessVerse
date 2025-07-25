import React, { useState, useEffect } from 'react';
import { Button } from './Button';

interface HintData {
    bestMove: string;
    hint: string;
}

interface HintSystemProps {
    socket: WebSocket | null;
    isYourTurn: boolean;
    isGameActive: boolean;
    isPracticeMode?: boolean;
}

export const HintSystem: React.FC<HintSystemProps> = ({ 
    socket, 
    isYourTurn, 
    isGameActive, 
    isPracticeMode = false 
}) => {
    const [currentHint, setCurrentHint] = useState<HintData | null>(null);
    const [showHint, setShowHint] = useState(false);
    const [hintsUsed, setHintsUsed] = useState(0);
    const [cooldown, setCooldown] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!socket) return;

        const handleMessage = (event: MessageEvent) => {
            const data = JSON.parse(event.data);
            console.log('Hint system received message:', data.type);
            
            if (data.type === 'hint_response') {
                console.log('Received hint response:', data.payload);
                setCurrentHint(data.payload);
                setShowHint(true);
                setHintsUsed(prev => prev + 1);
                setIsLoading(false);
                
                // Start cooldown (30 seconds)
                setCooldown(30);
                const interval = setInterval(() => {
                    setCooldown(prev => {
                        if (prev <= 1) {
                            clearInterval(interval);
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
            }
            
        };

        socket.addEventListener('message', handleMessage);
        return () => socket.removeEventListener('message', handleMessage);
    }, [socket]);

    const requestHint = () => {
        if (!socket || cooldown > 0 || !isYourTurn) return;

        console.log('Requesting hint from server...');
        setIsLoading(true);
        socket.send(JSON.stringify({
            type: 'request_hint',
            payload: {
                gameId: 'current_game' // You might want to pass actual gameId
            }
        }));
    };

    const canUseHint = isYourTurn && isGameActive && cooldown === 0 && (isPracticeMode || hintsUsed < 3);

    if (!isGameActive) return null;

    return (
        <>
            {/* Hint Button */}
            <div className="mb-4">
                <Button
                    onClick={requestHint}
                    disabled={!canUseHint}
                    variant={isPracticeMode ? "primary" : "outline"}
                    size="sm"
                    className="w-full"
                >
                    {isLoading ? (
                        `💡 Getting Hint...`
                    ) : cooldown > 0 ? (
                        `💡 Hint (${cooldown}s)`
                    ) : isPracticeMode ? (
                        `💡 Get Hint`
                    ) : (
                        `💡 Hint (${3 - hintsUsed} left)`
                    )}
                </Button>
                
                {!isPracticeMode && (
                    <div className="text-xs text-slate-400 mt-1 text-center">
                        {hintsUsed >= 3 ? 'No more hints available' : `${3 - hintsUsed} hints remaining`}
                    </div>
                )}
            </div>

            {/* Hint Display */}
            {showHint && currentHint && (
                <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-800 rounded-xl border border-slate-700 shadow-2xl p-6 w-96 z-50 animate-slide-in-right">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white font-semibold flex items-center">
                            <span className="text-2xl mr-2">💡</span>
                            Chess Engine Hint
                        </h3>
                        <button 
                            onClick={() => setShowHint(false)}
                            className="text-slate-400 hover:text-white"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    
                    <div className="space-y-3">
                        <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-lg p-4">
                            <div className="text-slate-300 text-sm mb-1">Suggested Move:</div>
                            <div className="text-emerald-400 font-mono text-xl font-bold">{currentHint.bestMove}</div>
                        </div>
                        
                        <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
                            <div className="text-blue-300">{currentHint.hint}</div>
                        </div>
                        
                        <div className="text-xs text-slate-400 text-center bg-slate-700/30 rounded p-2">
                            🤖 Powered by Stockfish Chess Engine
                        </div>
                    </div>
                    
                    <div className="mt-4">
                        <Button 
                            onClick={() => setShowHint(false)} 
                            variant="secondary" 
                            className="w-full"
                        >
                            Got it!
                        </Button>
                    </div>
                </div>
            )}
        </>
    );
};
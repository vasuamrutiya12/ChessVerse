import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './Button';

interface GameOverPopupProps {
    winner: string;
    message: string;
    onclose: () => void;
}

export const GameOverPopup: React.FC<GameOverPopupProps> = ({ winner, message, onclose }) => {
    const navigate = useNavigate();

    const handlePlayAgain = () => {
        onclose();
        // Reset the game state and start a new game
        window.location.reload();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4" onClick={onclose}>
            <div className="w-full max-w-lg bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="p-8 text-center">
                    <div className="mb-6">
                        <div className="text-6xl mb-4">
                            {winner.includes('win') || winner.includes('WIN') ? '🏆' : '🤝'}
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-2">Game Over</h2>
                        <div className="text-emerald-400 text-xl font-semibold">{winner}</div>
                    </div>
                    
                    <div className="bg-slate-700/50 rounded-lg p-4 mb-6">
                        <p className="text-slate-300 text-lg">{message}</p>
                    </div>
                    
                    <div className="space-y-3">
                        <Button 
                            onClick={handlePlayAgain} 
                            className="w-full"
                            size="lg"
                        >
                            🎮 Play Again
                        </Button>
                        <Button 
                            variant="secondary"
                            onClick={() => navigate('/')} 
                            className="w-full"
                        >
                            🏠 Back to Home
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
import React from 'react';
import { Button } from './Button';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface GameRequestsPopupProps {
    onClose: () => void;
}

const GameRequestsPopup: React.FC<GameRequestsPopupProps> = ({ onClose }) => {
    const { userdetails, checkAuth } = useAuth();
    const navigate = useNavigate();
    const gameRequests = userdetails?.user?.game_requests || [];

    const handleGameRequest = async (from: string, gameId: string, action: 'accept' | 'reject') => {
        if (!userdetails?.user?.email) return;

        try {
            const response = await fetch('http://localhost:3000/game/handlegamerequest', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    to: userdetails.user.email,
                    from,
                    gameId,
                    action
                })
            });

            if (response.ok) {
                checkAuth();
                
                if (action === 'accept') {
                    const ws = new WebSocket(`ws://localhost:8080?email=${userdetails.user.email}`);
                    ws.onopen = () => {
                        ws.send(JSON.stringify({
                            type: 'accept_game_request',
                            payload: {
                                gameId,
                                from,
                                to: userdetails.user.email
                            }
                        }));
                        navigate('/game');
                    };
                }
            } else {
                console.error('Failed to handle game request');
            }
        } catch (error) {
            console.error('Error handling game request:', error);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="w-full max-w-md bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-white">Game Requests</h2>
                        <button 
                            onClick={onClose}
                            className="text-slate-400 hover:text-white transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    
                    <div className="max-h-64 overflow-y-auto space-y-3">
                        {gameRequests.length > 0 ? (
                            gameRequests.map((request: { from: string, gameId: string }, index: number) => (
                                <div key={index} className="p-4 bg-slate-700/50 rounded-lg border border-slate-600/50">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                                                <span className="text-white font-semibold">
                                                    {request.from.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <div className="text-white font-medium">{request.from}</div>
                                                <div className="text-slate-400 text-sm">wants to play chess</div>
                                            </div>
                                        </div>
                                        <div className="text-2xl">⚔️</div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button 
                                            variant="success"
                                            size="sm"
                                            onClick={() => handleGameRequest(request.from, request.gameId, 'accept')}
                                            className="flex-1"
                                        >
                                            Accept Challenge
                                        </Button>
                                        <Button 
                                            variant="danger"
                                            size="sm"
                                            onClick={() => handleGameRequest(request.from, request.gameId, 'reject')}
                                            className="flex-1"
                                        >
                                            Decline
                                        </Button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <div className="text-slate-400">No game requests</div>
                            </div>
                        )}
                    </div>
                    
                    <div className="mt-6">
                        <Button variant="secondary" onClick={onClose} className="w-full">
                            Close
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GameRequestsPopup;
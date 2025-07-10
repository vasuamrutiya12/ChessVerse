import React from 'react';
import { Button } from './Button';
import { useAuth } from '../hooks/useAuth';

interface GameRequestsProps {
    socket: WebSocket | null;
}

export const GameRequests: React.FC<GameRequestsProps> = ({ socket }) => {
    const { userdetails, checkAuth } = useAuth();
    const gameRequests = userdetails?.user?.game_requests || [];

    const handleGameRequest = async (from: string, gameId: string, action: 'accept' | 'reject') => {
        if (!userdetails?.user?.email) return;

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/game/handlegamerequest`, {
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
                    if (socket) {
                        socket.send(JSON.stringify({
                            type: 'accept_game_request',
                            payload: {
                                gameId,
                                from: userdetails.user.email,
                                to: from
                            }
                        }));
                    }
                }
            } else {
                console.error('Failed to handle game request');
            }
        } catch (error) {
            console.error('Error handling game request:', error);
        }
    };

    return (
        <div className="mt-6">
            <h3 className="text-lg font-semibold text-white mb-4">Game Requests</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
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
        </div>
    );
}; 
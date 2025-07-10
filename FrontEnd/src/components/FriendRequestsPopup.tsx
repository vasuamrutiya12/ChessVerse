import React, { useState } from 'react';
import { Button } from './Button';
import { useAuth } from '../hooks/useAuth';

interface FriendRequestsPopupProps {
    onClose: () => void;
}

const FriendRequestsPopup: React.FC<FriendRequestsPopupProps> = ({ onClose }) => {
    const { userdetails, checkAuth } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState<string | null>(null);

    const filteredRequests = userdetails?.user?.friend_requests.filter((email: string) => 
        email.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const handleFriendRequest = async (email: string, action: 'accept' | 'reject') => {
        if (!userdetails?.user?.email) return;

        setLoading(`${email}-${action}`);
        try {
            const response = await fetch('https://chessverse-production.up.railway.app/game/handlefriendrequest', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    userEmail: userdetails.user.email,
                    friendEmail: email,
                    action
                })
            });

            if (response.ok) {
                checkAuth();
            } else {
                console.error('Failed to handle friend request');
            }
        } catch (error) {
            console.error('Error handling friend request:', error);
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="w-full max-w-md bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-white">Friend Requests</h2>
                        <button 
                            onClick={onClose}
                            className="text-slate-400 hover:text-white transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    
                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="Search requests..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                    </div>
                    
                    <div className="max-h-64 overflow-y-auto space-y-3">
                        {filteredRequests.length > 0 ? (
                            filteredRequests.map((email: string, index: number) => (
                                <div key={index} className="p-4 bg-slate-700/50 rounded-lg border border-slate-600/50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                                                <span className="text-white font-semibold">
                                                    {email.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <div className="text-white font-medium">{email}</div>
                                                <div className="text-slate-400 text-sm">wants to be your friend</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mt-3">
                                        <Button 
                                            variant="success"
                                            size="sm"
                                            onClick={() => handleFriendRequest(email, 'accept')}
                                            disabled={loading === `${email}-accept`}
                                            className="flex-1"
                                        >
                                            {loading === `${email}-accept` ? 'Accepting...' : 'Accept'}
                                        </Button>
                                        <Button 
                                            variant="danger"
                                            size="sm"
                                            onClick={() => handleFriendRequest(email, 'reject')}
                                            disabled={loading === `${email}-reject`}
                                            className="flex-1"
                                        >
                                            {loading === `${email}-reject` ? 'Rejecting...' : 'Reject'}
                                        </Button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <div className="text-slate-400">
                                    {searchTerm ? 'No matching requests' : 'No friend requests'}
                                </div>
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

export default FriendRequestsPopup;
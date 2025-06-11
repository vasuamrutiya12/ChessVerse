import React, { useState } from 'react';
import { Button } from './Button';
import { useAuth } from '../hooks/useAuth';

interface AddFriendPopupProps {
    emails: string[];
    onClose: () => void;
}

const AddFriendPopup: React.FC<AddFriendPopupProps> = ({ emails, onClose }) => {
    const { userdetails } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);

    const filteredEmails = emails.filter(email => 
        email.toLowerCase().includes(searchTerm.toLowerCase()) && email !== userdetails?.user?.email
    );

    const handleAddFriend = async (email: string) => {
        if (!userdetails) return;
        
        setLoading(true);
        const requestData = {
            from: userdetails.user.email,
            to: email
        };

        try {
            const response = await fetch('http://localhost:3000/game/sendfriendrequest', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(requestData)
            });

            if (response.ok) {
                console.log('Friend request sent successfully');
                // Show success feedback
            } else {
                console.error('Failed to send friend request');
            }
        } catch (error) {
            console.error('Error sending friend request:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="w-full max-w-md bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-white">Add Friends</h2>
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
                            placeholder="Search by email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                    </div>
                    
                    <div className="max-h-64 overflow-y-auto space-y-2">
                        {filteredEmails.length > 0 ? (
                            filteredEmails.map((email, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg border border-slate-600/50">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                                            <span className="text-white font-semibold text-sm">
                                                {email.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <span className="text-white text-sm">{email}</span>
                                    </div>
                                    <Button 
                                        variant="success"
                                        size="sm"
                                        onClick={() => handleAddFriend(email)}
                                        disabled={loading}
                                    >
                                        {loading ? '...' : '+'}
                                    </Button>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <div className="text-slate-400">
                                    {searchTerm ? 'No users found' : 'No available users'}
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

export default AddFriendPopup;
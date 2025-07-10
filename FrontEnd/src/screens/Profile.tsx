import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { useAuth } from '../hooks/useAuth';
import PlayerStats from '../components/PlayerStats';

export const Profile = () => {
    const navigate = useNavigate();
    const { userdetails, isAuthenticated } = useAuth();
    const [showGameHistory, setShowGameHistory] = useState(false);

    const handleLogout = async () => {
        try {
            // Clear the auth cookie by making a request to logout endpoint
            await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/logout`, {
                method: 'POST',
                credentials: 'include'
            });
            
            // Clear local storage and redirect
            localStorage.clear();
            window.location.href = '/';
        } catch (error) {
            console.error('Logout error:', error);
            // Force logout even if request fails
            localStorage.clear();
            window.location.href = '/';
        }
    };

    if (!isAuthenticated || !userdetails?.user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-white text-lg mb-4">Please log in to view your profile</div>
                    <Button onClick={() => navigate('/')}>
                        Go to Home
                    </Button>
                </div>
            </div>
        );
    }

    const user = userdetails.user;
    const totalGames = (user.wins || 0) + (user.losses || 0) + (user.draws || 0);
    const winRate = totalGames > 0 ? ((user.wins || 0) / totalGames * 100) : 0;

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <button 
                                onClick={() => navigate('/')}
                                className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center hover:scale-105 transition-transform"
                            >
                                <span className="text-white font-bold text-xl">♔</span>
                            </button>
                            <h1 className="text-2xl font-bold text-white">My Profile</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Button 
                                onClick={() => navigate('/game')}
                                variant="primary"
                            >
                                🎮 Play Chess
                            </Button>
                            <Button 
                                onClick={handleLogout}
                                variant="danger"
                            >
                                🚪 Logout
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-6 py-8">
                <div className="max-w-4xl mx-auto space-y-8">
                    {/* Profile Header */}
                    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 shadow-2xl">
                        <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                            {/* Avatar */}
                            <div className="relative">
                                <div className="w-32 h-32 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl">
                                    <span className="text-white font-bold text-4xl">
                                        {user.name?.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center border-4 border-slate-800">
                                    <span className="text-white font-bold">👑</span>
                                </div>
                            </div>

                            {/* User Info */}
                            <div className="flex-1 text-center md:text-left">
                                <h2 className="text-3xl font-bold text-white mb-2">{user.name}</h2>
                                <p className="text-slate-400 mb-4">{user.email}</p>
                                
                                {/* ELO Rating */}
                                <div className="inline-flex items-center bg-emerald-500/20 border border-emerald-500/30 rounded-full px-6 py-3 mb-4">
                                    <span className="text-emerald-400 font-bold text-2xl">{user.elo || 1200}</span>
                                    <span className="text-emerald-300 ml-2">ELO Rating</span>
                                </div>

                                {/* Quick Stats */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                                        <div className="text-2xl font-bold text-green-400">{user.wins || 0}</div>
                                        <div className="text-slate-400 text-sm">Wins</div>
                                    </div>
                                    <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                                        <div className="text-2xl font-bold text-red-400">{user.losses || 0}</div>
                                        <div className="text-slate-400 text-sm">Losses</div>
                                    </div>
                                    <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                                        <div className="text-2xl font-bold text-yellow-400">{user.draws || 0}</div>
                                        <div className="text-slate-400 text-sm">Draws</div>
                                    </div>
                                    <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                                        <div className="text-2xl font-bold text-blue-400">{winRate.toFixed(1)}%</div>
                                        <div className="text-slate-400 text-sm">Win Rate</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
                        <div className="flex border-b border-slate-700/50">
                            <button
                                onClick={() => setShowGameHistory(false)}
                                className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                                    !showGameHistory 
                                        ? 'bg-emerald-500/20 text-emerald-400 border-b-2 border-emerald-500' 
                                        : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                📊 Statistics
                            </button>
                            <button
                                onClick={() => setShowGameHistory(true)}
                                className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                                    showGameHistory 
                                        ? 'bg-emerald-500/20 text-emerald-400 border-b-2 border-emerald-500' 
                                        : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                📜 Game History
                            </button>
                        </div>

                        <div className="p-6">
                            {!showGameHistory ? (
                                /* Detailed Statistics */
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Performance Metrics */}
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-semibold text-white mb-4">Performance</h3>
                                            
                                            <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                                                <span className="text-slate-300">Current Streak</span>
                                                <span className={`font-semibold ${
                                                    (user.currentStreak || 0) > 0 ? 'text-green-400' : 
                                                    (user.currentStreak || 0) < 0 ? 'text-red-400' : 'text-slate-400'
                                                }`}>
                                                    {(user.currentStreak || 0) > 0 ? `+${user.currentStreak}` : (user.currentStreak || 0)}
                                                </span>
                                            </div>
                                            
                                            <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                                                <span className="text-slate-300">Total Games</span>
                                                <span className="text-blue-400 font-semibold">{totalGames}</span>
                                            </div>
                                            
                                            <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                                                <span className="text-slate-300">Average Move Time</span>
                                                <span className="text-purple-400 font-semibold">
                                                    {(user.averageMoveTime || 0).toFixed(1)}s
                                                </span>
                                            </div>
                                        </div>

                                        {/* Friends & Social */}
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-semibold text-white mb-4">Social</h3>
                                            
                                            <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                                                <span className="text-slate-300">Friends</span>
                                                <span className="text-emerald-400 font-semibold">
                                                    {user.friend_list?.length || 0}
                                                </span>
                                            </div>
                                            
                                            <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                                                <span className="text-slate-300">Pending Requests</span>
                                                <span className="text-yellow-400 font-semibold">
                                                    {user.friend_requests?.length || 0}
                                                </span>
                                            </div>
                                            
                                            <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                                                <span className="text-slate-300">Game Requests</span>
                                                <span className="text-orange-400 font-semibold">
                                                    {user.game_requests?.length || 0}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Win Rate Progress Bar */}
                                    <div className="bg-slate-700/30 rounded-lg p-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-slate-300">Win Rate</span>
                                            <span className="text-emerald-400 font-semibold">{winRate.toFixed(1)}%</span>
                                        </div>
                                        <div className="w-full bg-slate-600 rounded-full h-3">
                                            <div 
                                                className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-3 rounded-full transition-all duration-500"
                                                style={{ width: `${Math.min(winRate, 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                /* Game History */
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-white mb-4">Recent Games</h3>
                                    
                                    {user.gameHistory && user.gameHistory.length > 0 ? (
                                        <div className="space-y-3 max-h-96 overflow-y-auto">
                                            {user.gameHistory.slice().reverse().map((gameId: string, index: number) => (
                                                <div key={gameId} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center">
                                                            <span className="text-white font-semibold">
                                                                {user.gameHistory.length - index}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <div className="text-white font-medium">Game #{user.gameHistory.length - index}</div>
                                                            <div className="text-slate-400 text-sm">Game ID: {gameId}</div>
                                                        </div>
                                                    </div>
                                                    <div className="text-slate-400">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12">
                                            <div className="text-6xl mb-4">🎮</div>
                                            <div className="text-slate-400 text-lg mb-2">No games played yet</div>
                                            <div className="text-slate-500 text-sm mb-6">Start playing to see your game history here</div>
                                            <Button onClick={() => navigate('/game')}>
                                                Play Your First Game
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Detailed Player Stats Component */}
                    <PlayerStats email={user.email} />
                </div>
            </div>
        </div>
    );
};
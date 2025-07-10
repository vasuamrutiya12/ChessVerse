import { useNavigate } from "react-router-dom"
import { Button } from "../components/Button";
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from "../hooks/useAuth";
import { useState } from "react";
import AddFriendPopup from "../components/AddFriendPopup";
import FriendRequestsPopup from "../components/FriendRequestsPopup";
import Leaderboard from '../components/Leaderboard';
import PlayerStats from '../components/PlayerStats';

export const Landing = () => {
    const navigate = useNavigate();
    const { isAuthenticated, loading, userdetails, handleGoogleLogin } = useAuth();
    const [showAddFriendPopup, setShowAddFriendPopup] = useState(false);
    const [showFriendRequestsPopup, setShowFriendRequestsPopup] = useState(false);
    const [selectedPlayerEmail, setSelectedPlayerEmail] = useState<string>('');

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                    <div className="text-white text-lg">Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-xl">♔</span>
                            </div>
                            <h1 className="text-2xl font-bold text-white">ChessMaster</h1>
                        </div>
                        {isAuthenticated && (
                            <div className="flex items-center space-x-4">
                                <div className="text-emerald-400 font-medium">
                                    Welcome, {userdetails?.user?.name}
                                </div>
                                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                                    <span className="text-white font-semibold text-sm">
                                        {userdetails?.user?.name?.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 container mx-auto px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
                    {/* Left Column - Image */}
                    <div className="flex justify-center lg:justify-end order-2 lg:order-1">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-3xl blur-3xl"></div>
                            <img 
                                src="./chessboard.jpeg" 
                                className="relative max-w-md w-full rounded-2xl shadow-2xl border border-slate-700/50" 
                                alt="Chess Board"
                            />
                        </div>
                    </div>

                    {/* Right Column - Content */}
                    <div className="text-center lg:text-left order-1 lg:order-2">
                        <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                            Play Chess
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">
                                Like a Master
                            </span>
                        </h1>
                        
                        <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                            Challenge players worldwide in the most sophisticated chess experience. 
                            Master your skills, climb the ranks, and become a legend.
                        </p>

                        {/* Authentication Section */}
                        <div className="space-y-6">
                            {isAuthenticated ? (
                                <div className="space-y-4">
                                    <Button 
                                        onClick={() => navigate("/game")} 
                                        size="lg"
                                        className="w-full sm:w-auto"
                                    >
                                        🎮 Start Playing
                                    </Button>
                                    
                                    {/* User Actions */}
                                    <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                                        <Button
                                            variant="primary"
                                            size="md"
                                            onClick={() => navigate('/profile')}
                                        >
                                            👤 My Profile
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="md"
                                            onClick={() => setShowAddFriendPopup(true)}
                                        >
                                            👥 Add Friends
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            size="md"
                                            onClick={() => setShowFriendRequestsPopup(true)}
                                        >
                                            📨 Friend Requests
                                            {userdetails?.user?.friend_requests?.length > 0 && (
                                                <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                                                    {userdetails.user.friend_requests.length}
                                                </span>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex justify-center lg:justify-start">
                                    <div className="bg-white rounded-xl p-1 shadow-xl">
                                        <GoogleLogin
                                            onSuccess={credentialResponse => {
                                                handleGoogleLogin(credentialResponse.credential || "");
                                            }}
                                            onError={() => {
                                                console.log('Login Failed');
                                            }}
                                            useOneTap
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Features */}
                        {isAuthenticated && (
                            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                                    <div className="text-emerald-400 text-2xl mb-2">⚡</div>
                                    <h3 className="text-white font-semibold mb-2">Quick Match</h3>
                                    <p className="text-slate-400 text-sm">Find opponents instantly</p>
                                </div>
                                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                                    <div className="text-emerald-400 text-2xl mb-2">👥</div>
                                    <h3 className="text-white font-semibold mb-2">Friends</h3>
                                    <p className="text-slate-400 text-sm">Play with your friends</p>
                                </div>
                                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                                    <div className="text-emerald-400 text-2xl mb-2">🏆</div>
                                    <h3 className="text-white font-semibold mb-2">Compete</h3>
                                    <p className="text-slate-400 text-sm">Climb the leaderboard</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Leaderboard and Player Stats Section */}
                {isAuthenticated && (
                    <div className="mt-16 space-y-8">
                        <Leaderboard />
                        
                        {/* Player Stats Input */}
                        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
                            <h3 className="text-xl font-bold text-white mb-4">View Player Statistics</h3>
                            <div className="flex gap-3">
                                <input
                                    type="email"
                                    placeholder="Enter player email..."
                                    value={selectedPlayerEmail}
                                    onChange={(e) => setSelectedPlayerEmail(e.target.value)}
                                    className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                                <Button
                                    onClick={() => navigate('/profile')}
                                    variant="outline"
                                    size="md"
                                >
                                    View Profile
                                </Button>
                            </div>
                        </div>
                        
                        {selectedPlayerEmail && (
                            <PlayerStats email={selectedPlayerEmail} />
                        )}
                    </div>
                )}
            </main>

            {/* Popups */}
            {showAddFriendPopup && (
                <AddFriendPopup 
                    emails={userdetails?.users || []} 
                    onClose={() => setShowAddFriendPopup(false)} 
                />
            )}
            {showFriendRequestsPopup && (
                <FriendRequestsPopup 
                    onClose={() => setShowFriendRequestsPopup(false)} 
                />
            )}
        </div>
    );
}
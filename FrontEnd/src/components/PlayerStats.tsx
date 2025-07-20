import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api';

interface PlayerStatsProps {
  email: string;
}

interface PlayerStatsData {
  name: string;
  email: string;
  elo: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  averageMoveTime: number;
  currentStreak: number;
  gameHistory: string[];
}

const PlayerStats: React.FC<PlayerStatsProps> = ({ email }) => {
  const [data, setData] = useState<PlayerStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!email) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    fetch(`${apiUrl}/api/player-stats/${encodeURIComponent(email.trim())}`, {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        setData(data);
        setError(null);
      })
      .catch(e => {
        console.error('Error fetching player stats:', e);
        setError(e.message);
        setData(null);
        
      })
      .finally(() => setLoading(false));
  }, [email]);

  if (!email) {
    return null;
  }

  if (loading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 mt-8">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          <span className="ml-3 text-slate-400">Loading player stats...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 mt-8">
        <div className="text-center py-8">
          <div className="text-red-400 mb-2">⚠️ Error loading player stats</div>
          <div className="text-slate-400 text-sm">{error}</div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 mt-8">
        <div className="text-center py-8">
          <div className="text-slate-400">No player data found</div>
        </div>
      </div>
    );
  }

  const totalGames = data.wins + data.losses + data.draws;

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 mt-8">
      <div className="flex items-center mb-6">
        <div className="text-2xl mr-3">📊</div>
        <h2 className="text-2xl font-bold text-white">Player Statistics</h2>
      </div>

      {/* Player Header */}
      <div className="flex items-center space-x-4 mb-6 p-4 bg-slate-700/50 rounded-lg">
        <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-xl">
            {data.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">{data.name}</h3>
          <p className="text-slate-400">{data.email}</p>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-emerald-400 font-bold text-lg">{data.elo}</span>
            <span className="text-slate-400">ELO</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-700/30 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{data.wins}</div>
          <div className="text-slate-400 text-sm">Wins</div>
        </div>
        <div className="bg-slate-700/30 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-400">{data.losses}</div>
          <div className="text-slate-400 text-sm">Losses</div>
        </div>
        <div className="bg-slate-700/30 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">{data.draws}</div>
          <div className="text-slate-400 text-sm">Draws</div>
        </div>
        <div className="bg-slate-700/30 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{totalGames}</div>
          <div className="text-slate-400 text-sm">Total Games</div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="space-y-4">
        <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
          <span className="text-slate-300">Win Rate</span>
          <span className="text-emerald-400 font-semibold">
            {(data.winRate * 100).toFixed(1)}%
          </span>
        </div>
        
        <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
          <span className="text-slate-300">Current Streak</span>
          <span className={`font-semibold ${
            data.currentStreak > 0 ? 'text-green-400' : 
            data.currentStreak < 0 ? 'text-red-400' : 'text-slate-400'
          }`}>
            {data.currentStreak > 0 ? `+${data.currentStreak}` : data.currentStreak}
          </span>
        </div>
        
        <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
          <span className="text-slate-300">Avg Move Time</span>
          <span className="text-blue-400 font-semibold">
            {data.averageMoveTime.toFixed(1)}s
          </span>
        </div>
      </div>

      {/* Game History */}
      {data.gameHistory.length > 0 && (
        <div className="mt-6">
          <h4 className="text-lg font-semibold text-white mb-3">Recent Games</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {data.gameHistory.slice(-5).reverse().map((gameId, idx) => (
              <div key={gameId} className="flex items-center justify-between p-2 bg-slate-700/30 rounded text-sm">
                <span className="text-slate-400">Game #{data.gameHistory.length - idx}</span>
                <span className="text-slate-300 font-mono">{gameId}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerStats;
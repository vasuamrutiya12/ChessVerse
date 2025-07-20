import React, { useEffect, useState } from 'react';

interface LeaderboardEntry {
  name: string;
  email: string;
  elo: number;
  wins: number;
  losses: number;
  draws: number;
  currentStreak: number;
}

const Leaderboard: React.FC = () => {
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Fetching leaderboard...');
    
    // Try relative URL first, then fallback to absolute URL
    const fetchLeaderboard = async () => {
      const urls = [
        '/api/leaderboard?topN=10',
        'http://localhost:3000/api/leaderboard?topN=10'
      ];
      
      for (const url of urls) {
        try {
          console.log(`Trying to fetch from: ${url}`);
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include'
          });
          
          console.log(`Response status: ${response.status}`);
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error(`Error response: ${errorText}`);
            throw new Error(`HTTP ${response.status}: ${errorText}`);
          }
          
          const data = await response.json();
          console.log('Leaderboard data received:', data);
          setData(data);
          setError(null);
          return; // Success, exit the loop
        } catch (err) {
          console.error(`Failed to fetch from ${url}:`, err);
          if (url === urls[urls.length - 1]) {
            // Last URL failed, set error
            setError(err instanceof Error ? err.message : 'Unknown error');
          }
        }
      }
    };
    
    fetchLeaderboard()
      .finally(() => setLoading(false));
  }, []);
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch leaderboard');
        return res.json();
      })
      .then(setData)
      .catch(e => {
        console.error('Leaderboard fetch error:', e);
        setError(e.message);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 mt-8">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          <span className="ml-3 text-slate-400">Loading leaderboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 mt-8">
        <div className="text-center py-8">
          <div className="text-red-400 mb-2">⚠️ Error loading leaderboard</div>
          <div className="text-slate-400 text-sm">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 mt-8">
      <div className="flex items-center mb-6">
        <div className="text-2xl mr-3">🏆</div>
        <h2 className="text-2xl font-bold text-white">Global Leaderboard</h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-600">
              <th className="text-left py-3 px-2 text-slate-300 font-semibold">Rank</th>
              <th className="text-left py-3 px-2 text-slate-300 font-semibold">Player</th>
              <th className="text-center py-3 px-2 text-slate-300 font-semibold">ELO</th>
              <th className="text-center py-3 px-2 text-slate-300 font-semibold">W/L/D</th>
              <th className="text-center py-3 px-2 text-slate-300 font-semibold">Streak</th>
            </tr>
          </thead>
          <tbody>
            {data.map((entry, idx) => (
              <tr key={entry.email} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                <td className="py-4 px-2">
                  <div className="flex items-center">
                    <span className={`font-bold text-lg ${
                      idx === 0 ? 'text-yellow-400' : 
                      idx === 1 ? 'text-gray-300' : 
                      idx === 2 ? 'text-amber-600' : 'text-slate-400'
                    }`}>
                      #{idx + 1}
                    </span>
                    {idx < 3 && (
                      <span className="ml-2 text-lg">
                        {idx === 0 ? '👑' : idx === 1 ? '🥈' : '🥉'}
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-4 px-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {entry.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="text-white font-medium">{entry.name}</div>
                      <div className="text-slate-400 text-sm">{entry.email}</div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-2 text-center">
                  <span className="text-emerald-400 font-bold text-lg">{entry.elo}</span>
                </td>
                <td className="py-4 px-2 text-center">
                  <div className="text-sm">
                    <span className="text-green-400">{entry.wins}</span>
                    <span className="text-slate-400 mx-1">/</span>
                    <span className="text-red-400">{entry.losses}</span>
                    <span className="text-slate-400 mx-1">/</span>
                    <span className="text-yellow-400">{entry.draws}</span>
                  </div>
                </td>
                <td className="py-4 px-2 text-center">
                  <span className={`font-semibold ${
                    entry.currentStreak > 0 ? 'text-green-400' : 
                    entry.currentStreak < 0 ? 'text-red-400' : 'text-slate-400'
                  }`}>
                    {entry.currentStreak > 0 ? `+${entry.currentStreak}` : entry.currentStreak}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {data.length === 0 && (
        <div className="text-center py-8">
          <div className="text-slate-400">No players found</div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
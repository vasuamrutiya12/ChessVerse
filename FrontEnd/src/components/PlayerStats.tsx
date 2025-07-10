import React, { useEffect, useState } from 'react';

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
    fetch(`http://localhost:8080/api/player-stats/${email}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch player stats');
        return res.json();
      })
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [email]);

  if (loading) return <div>Loading player stats...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>No data found.</div>;

  return (
    <div className="player-stats-container">
      <h2>Player Stats: {data.name}</h2>
      <ul>
        <li><strong>Email:</strong> {data.email}</li>
        <li><strong>ELO:</strong> {data.elo}</li>
        <li><strong>Wins:</strong> {data.wins}</li>
        <li><strong>Losses:</strong> {data.losses}</li>
        <li><strong>Draws:</strong> {data.draws}</li>
        <li><strong>Win Rate:</strong> {(data.winRate * 100).toFixed(1)}%</li>
        <li><strong>Average Move Time:</strong> {data.averageMoveTime.toFixed(2)}s</li>
        <li><strong>Current Streak:</strong> {data.currentStreak}</li>
        <li><strong>Game History:</strong>
          <ul>
            {data.gameHistory.map((gameId, idx) => (
              <li key={gameId}>{idx + 1}. {gameId}</li>
            ))}
          </ul>
        </li>
      </ul>
    </div>
  );
};

export default PlayerStats; 
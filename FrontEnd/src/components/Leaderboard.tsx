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
    fetch('http://localhost:8080/api/leaderboard?topN=10')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch leaderboard');
        return res.json();
      })
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading leaderboard...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="leaderboard-container">
      <h2>Global Leaderboard</h2>
      <table className="leaderboard-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Name</th>
            <th>ELO</th>
            <th>Wins</th>
            <th>Losses</th>
            <th>Draws</th>
            <th>Streak</th>
          </tr>
        </thead>
        <tbody>
          {data.map((entry, idx) => (
            <tr key={entry.email}>
              <td>{idx + 1}</td>
              <td>{entry.name}</td>
              <td>{entry.elo}</td>
              <td>{entry.wins}</td>
              <td>{entry.losses}</td>
              <td>{entry.draws}</td>
              <td>{entry.currentStreak}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Leaderboard; 
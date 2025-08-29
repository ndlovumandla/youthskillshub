import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('all'); // all, month, week

  useEffect(() => {
    fetchLeaderboard();
  }, [timeframe]);

  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/leaderboard/?timeframe=${timeframe}`);
      setLeaderboard(response.data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank}`;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1:
        return 'text-yellow-400';
      case 2:
        return 'text-gray-400';
      case 3:
        return 'text-orange-400';
      default:
        return 'text-green-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-green-400 flex items-center justify-center">
        <div className="text-2xl">Loading leaderboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-green-400">
      <header className="border-b-2 border-green-400 p-4">
        <h1 className="text-2xl text-pink-400">Leaderboard</h1>
        <nav className="mt-2">
          <button
            onClick={() => setTimeframe('all')}
            className={`mr-4 ${timeframe === 'all' ? 'text-cyan-400' : 'hover:text-pink-400'}`}
          >
            All Time
          </button>
          <button
            onClick={() => setTimeframe('month')}
            className={`mr-4 ${timeframe === 'month' ? 'text-cyan-400' : 'hover:text-pink-400'}`}
          >
            This Month
          </button>
          <button
            onClick={() => setTimeframe('week')}
            className={`${timeframe === 'week' ? 'text-cyan-400' : 'hover:text-pink-400'}`}
          >
            This Week
          </button>
        </nav>
      </header>

      <main className="p-8">
        <div className="max-w-4xl mx-auto">
          <section className="text-center mb-8">
            <h2 className="text-4xl text-cyan-400 mb-4">Top Learners</h2>
            <p className="text-lg">Compete with fellow learners and climb the ranks!</p>
          </section>

          {/* Top 3 Podium */}
          {leaderboard.length >= 3 && (
            <section className="mb-8">
              <div className="grid grid-cols-3 gap-4 text-center">
                {/* 2nd Place */}
                <div className="order-1">
                  <div className="border-2 border-gray-400 p-6">
                    <div className="text-6xl mb-2">🥈</div>
                    <h3 className="text-xl text-gray-400">{leaderboard[1]?.user?.first_name} {leaderboard[1]?.user?.last_name}</h3>
                    <p className="text-2xl text-gray-400">{leaderboard[1]?.points || 0} pts</p>
                    <p className="text-sm text-green-400">Level {leaderboard[1]?.level || 1}</p>
                  </div>
                </div>

                {/* 1st Place */}
                <div className="order-2">
                  <div className="border-2 border-yellow-400 p-6">
                    <div className="text-8xl mb-2">🥇</div>
                    <h3 className="text-2xl text-yellow-400">{leaderboard[0]?.user?.first_name} {leaderboard[0]?.user?.last_name}</h3>
                    <p className="text-3xl text-yellow-400">{leaderboard[0]?.points || 0} pts</p>
                    <p className="text-sm text-green-400">Level {leaderboard[0]?.level || 1}</p>
                  </div>
                </div>

                {/* 3rd Place */}
                <div className="order-3">
                  <div className="border-2 border-orange-400 p-6">
                    <div className="text-6xl mb-2">🥉</div>
                    <h3 className="text-xl text-orange-400">{leaderboard[2]?.user?.first_name} {leaderboard[2]?.user?.last_name}</h3>
                    <p className="text-2xl text-orange-400">{leaderboard[2]?.points || 0} pts</p>
                    <p className="text-sm text-green-400">Level {leaderboard[2]?.level || 1}</p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Full Leaderboard */}
          <section>
            <h3 className="text-2xl text-yellow-400 mb-4">Full Rankings</h3>
            <div className="space-y-2">
              {leaderboard.map((entry, index) => {
                const rank = index + 1;
                return (
                  <div
                    key={entry.user?.id || index}
                    className={`border-2 p-4 flex justify-between items-center ${
                      rank <= 3 ? 'border-cyan-400' : 'border-green-400'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className={`text-2xl mr-4 ${getRankColor(rank)}`}>
                        {getRankIcon(rank)}
                      </span>
                      <div>
                        <h4 className="text-xl text-cyan-400">
                          {entry.user?.first_name} {entry.user?.last_name}
                        </h4>
                        <p className="text-sm text-green-400">@{entry.user?.username}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl text-yellow-400">{entry.points || 0} pts</p>
                      <p className="text-sm text-green-400">Level {entry.level || 1}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {leaderboard.length === 0 && (
              <div className="text-center py-8">
                <p className="text-green-400">No rankings available yet. Be the first to earn points!</p>
              </div>
            )}
          </section>

          {/* How to Earn Points */}
          <section className="mt-8">
            <h3 className="text-2xl text-yellow-400 mb-4">How to Earn Points</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border-2 border-cyan-400 p-4">
                <h4 className="text-cyan-400 mb-2">📚 Course Completion</h4>
                <p className="text-green-400">Earn 50-200 points per completed module</p>
              </div>
              <div className="border-2 border-cyan-400 p-4">
                <h4 className="text-cyan-400 mb-2">🏆 Achievements</h4>
                <p className="text-green-400">Unlock badges and earn bonus points</p>
              </div>
              <div className="border-2 border-cyan-400 p-4">
                <h4 className="text-cyan-400 mb-2">🤝 Mentorship</h4>
                <p className="text-green-400">Help others and gain mentorship points</p>
              </div>
              <div className="border-2 border-cyan-400 p-4">
                <h4 className="text-cyan-400 mb-2">👥 Study Groups</h4>
                <p className="text-green-400">Participate in group activities</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Leaderboard;

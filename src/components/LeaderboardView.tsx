import React, { useState, useEffect } from 'react';
import { fetchLeaderboardApi } from '../lib/api';
import { Trophy, Medal, Crown } from 'lucide-react';

export const LeaderboardView: React.FC = () => {
  const [leaders, setLeaders] = useState<any[]>(() => {
    try {
      const cached = localStorage.getItem('nxb_leaderboard_cache');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const res = await fetchLeaderboardApi();
      if (res.leaderboard) {
        setLeaders(res.leaderboard);
        localStorage.setItem('nxb_leaderboard_cache', JSON.stringify(res.leaderboard));
      }
    } catch (err) {
      console.warn('[Cache] Using cached leaderboard due to network error:', err);
    }
  };

  return (
    <div className="flex flex-col gap-4 px-4 pt-2 pb-24 text-amber-50">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#38261e] to-[#261914] p-4 rounded-3xl border border-[#52382c]/80 shadow-xl flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-amber-100 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>TOP $NXB HOLDERS</span>
          </h2>
          <p className="text-xs text-amber-300/70 mt-1">
            Global leaderboard ranking top active tap hunters and top earners.
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xl">
          👑
        </div>
      </div>

      {/* Rankings List */}
      <div className="flex flex-col gap-2">
        {leaders.map((leader, index) => {
          const rank = index + 1;
          return (
            <div
              key={leader.id || index}
              className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                rank === 1
                  ? 'bg-gradient-to-r from-amber-500/20 via-orange-500/10 to-amber-500/20 border-amber-400/60 shadow-lg shadow-amber-500/10'
                  : rank === 2
                  ? 'bg-[#2b1d18] border-[#4a342b]'
                  : rank === 3
                  ? 'bg-[#251914] border-[#422e26]'
                  : 'bg-[#201410] border-[#38261e]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs font-mono shadow-md ${
                    rank === 1
                      ? 'bg-amber-400 text-black'
                      : rank === 2
                      ? 'bg-amber-200 text-black'
                      : rank === 3
                      ? 'bg-amber-600 text-white'
                      : 'bg-[#33221b] text-amber-300'
                  }`}
                >
                  {rank === 1 ? <Crown className="w-4 h-4 fill-black" /> : `#${rank}`}
                </div>

                <div>
                  <div className="font-bold text-sm text-amber-100">{leader.name}</div>
                  <div className="text-[10px] text-amber-300/60 font-mono">Subject Lvl {leader.subjectLevel || 1}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <img src="https://www.nxpost.online/assets/nxb_golden_coin_1784869821261-98Swi7wt.jpg" alt="Coin" className="w-5 h-5 rounded-full" />
                <span className="font-mono font-black text-amber-300 text-sm">
                  {leader.balance ? leader.balance.toLocaleString('en-US', { maximumFractionDigits: 1 }) : '0.0'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

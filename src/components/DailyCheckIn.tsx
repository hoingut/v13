import React, { useState } from 'react';
import { User } from '../types';
import { claimDailyCheckInApi } from '../lib/api';
import { Calendar, Gift, Flame, CheckCircle, Sparkles, AlertCircle } from 'lucide-react';

interface DailyCheckInProps {
  user: User | null;
  onUpdateUser: (user: User) => void;
  onOpenAuth: () => void;
}

const CHECKIN_DAYS = [
  { day: 1, reward: 500 },
  { day: 2, reward: 1000 },
  { day: 3, reward: 2500 },
  { day: 4, reward: 5000 },
  { day: 5, reward: 10000 },
  { day: 6, reward: 15000 },
  { day: 7, reward: 25000, bonus: '⚡ +100 Energy' },
];

export const DailyCheckIn: React.FC<DailyCheckInProps> = ({ user, onUpdateUser, onOpenAuth }) => {
  const [loading, setLoading] = useState(false);
  const [claimMessage, setClaimMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const isClaimedToday = user?.lastCheckInDate === todayStr;
  const currentStreak = user?.checkInStreak || 0;

  const handleClaim = async () => {
    if (!user) {
      onOpenAuth();
      return;
    }

    if (isClaimedToday) return;

    setLoading(true);
    setClaimMessage(null);
    setIsError(false);

    try {
      const res = await claimDailyCheckInApi(user.id);
      setLoading(false);

      if (res.success && res.user) {
        onUpdateUser(res.user);
        setClaimMessage(res.message);
        setIsError(false);
      } else {
        setClaimMessage(res.error || 'Failed to claim reward');
        setIsError(true);
      }
    } catch (err) {
      setLoading(false);
      setClaimMessage('Network error claiming reward');
      setIsError(true);
    }
  };

  return (
    <div className="bg-gradient-to-b from-[#2a1b15] to-[#1c110d] p-4 rounded-3xl border border-[#4d362c]/80 shadow-2xl relative overflow-hidden my-2">
      {/* Background ambient lighting */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-amber-100 flex items-center gap-1.5">
              <span>Daily Check-in Bonus</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            </h3>
            <p className="text-[11px] text-amber-300/70">Return daily to keep your streak & double rewards!</p>
          </div>
        </div>

        {/* Streak Pill */}
        <div className="flex items-center gap-1 bg-gradient-to-r from-orange-500/20 to-amber-500/20 px-2.5 py-1 rounded-full border border-orange-500/40 text-orange-300 text-xs font-mono font-bold shadow-inner">
          <Flame className="w-4 h-4 text-orange-400 fill-orange-400 animate-bounce" />
          <span>{currentStreak} Day Streak</span>
        </div>
      </div>

      {/* 7 Days Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mb-3">
        {CHECKIN_DAYS.map(item => {
          const isDone = currentStreak >= item.day || (isClaimedToday && currentStreak === item.day);
          const isCurrentActive = !isClaimedToday && (currentStreak % 7 + 1) === item.day;

          return (
            <div
              key={item.day}
              className={`p-2 rounded-2xl border flex flex-col items-center justify-between text-center transition-all relative overflow-hidden ${
                isDone
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                  : isCurrentActive
                  ? 'bg-gradient-to-b from-amber-500/30 via-orange-600/30 to-amber-600/20 border-amber-400 ring-2 ring-amber-400/50 scale-105 text-white shadow-lg'
                  : 'bg-[#150d0a] border-[#38261e] text-amber-200/50'
              }`}
            >
              <span className="text-[10px] font-bold tracking-wider uppercase opacity-80">
                Day {item.day}
              </span>

              <div className="my-1.5">
                {isDone ? (
                  <CheckCircle className="w-5 h-5 text-amber-400 fill-amber-400/20" />
                ) : (
                  <Gift className={`w-5 h-5 ${isCurrentActive ? 'text-amber-300 animate-pulse' : 'text-amber-400/40'}`} />
                )}
              </div>

              <div className="font-mono text-[10px] font-black leading-tight">
                +{item.reward.toLocaleString()}
              </div>

              {item.bonus && (
                <span className="text-[8px] font-bold text-orange-300 bg-orange-500/20 px-1 rounded mt-1">
                  Energy
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Claim Message Toast */}
      {claimMessage && (
        <div
          className={`p-2.5 rounded-2xl text-xs flex items-center gap-2 mb-3 ${
            isError ? 'bg-rose-950/80 border border-rose-500/80 text-rose-200' : 'bg-emerald-950/80 border border-emerald-500/80 text-emerald-200'
          }`}
        >
          {isError ? <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" /> : <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />}
          <span className="font-medium">{claimMessage}</span>
        </div>
      )}

      {/* Claim Action Button */}
      <button
        onClick={handleClaim}
        disabled={isClaimedToday || loading}
        className={`w-full py-2.5 px-4 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer ${
          isClaimedToday
            ? 'bg-[#211612] border border-[#3d2921] text-amber-200/50 cursor-not-allowed'
            : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-black border border-amber-300 shadow-orange-500/30 active:scale-98'
        }`}
      >
        {loading ? (
          <span>Claiming Daily Reward...</span>
        ) : isClaimedToday ? (
          <>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Claimed Today ✓ Come Back Tomorrow</span>
          </>
        ) : (
          <>
            <Gift className="w-4 h-4" />
            <span>Claim Today's Bonus Reward</span>
          </>
        )}
      </button>
    </div>
  );
};

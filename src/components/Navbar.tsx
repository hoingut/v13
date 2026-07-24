import React from 'react';
import { Flag, Trophy, Users, Zap, Gamepad2 } from 'lucide-react';

export type TabType = 'task' | 'top' | 'game' | 'upgrades' | 'friends';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  pendingTasksCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, pendingTasksCount = 0 }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto px-4 pb-4 pt-2 bg-gradient-to-t from-[#140c0a] via-[#140c0a]/90 to-transparent pointer-events-none">
      <nav className="pointer-events-auto bg-[#241814]/90 backdrop-blur-xl border border-[#443027]/70 rounded-3xl px-3 py-2 flex items-center justify-between shadow-2xl shadow-black/80">
        {/* Task Tab */}
        <button
          onClick={() => setActiveTab('task')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all relative ${
            activeTab === 'task' ? 'text-amber-400 font-bold scale-105' : 'text-amber-200/50 hover:text-amber-200'
          }`}
        >
          <div className="relative">
            <Flag className="w-5 h-5" />
            {pendingTasksCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {pendingTasksCount}
              </span>
            )}
          </div>
          <span className="text-[10px]">Task</span>
        </button>

        {/* Top Leaderboard Tab */}
        <button
          onClick={() => setActiveTab('top')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all ${
            activeTab === 'top' ? 'text-amber-400 font-bold scale-105' : 'text-amber-200/50 hover:text-amber-200'
          }`}
        >
          <Trophy className="w-5 h-5" />
          <span className="text-[10px]">Top</span>
        </button>

        {/* Center HedHog Button */}
        <button
          onClick={() => setActiveTab('game')}
          className="relative -top-3 group flex flex-col items-center"
        >
          <div
            className={`w-16 h-12 rounded-2xl flex items-center justify-center font-black text-xs tracking-wider shadow-xl transition-all border transform active:scale-95 ${
              activeTab === 'game'
                ? 'bg-gradient-to-b from-amber-400 via-orange-500 to-amber-600 text-white border-amber-300 shadow-orange-500/50 scale-105 ring-2 ring-orange-400/40'
                : 'bg-gradient-to-b from-[#3a2720] to-[#251712] text-amber-200 border-[#5a3f34] hover:border-amber-500/50'
            }`}
          >
            <span>HedHog</span>
          </div>
        </button>

        {/* Upgrades Tab */}
        <button
          onClick={() => setActiveTab('upgrades')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all ${
            activeTab === 'upgrades' ? 'text-amber-400 font-bold scale-105' : 'text-amber-200/50 hover:text-amber-200'
          }`}
        >
          <Zap className="w-5 h-5" />
          <span className="text-[10px]">Boost</span>
        </button>

        {/* Friends / Referral Tab */}
        <button
          onClick={() => setActiveTab('friends')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all ${
            activeTab === 'friends' ? 'text-amber-400 font-bold scale-105' : 'text-amber-200/50 hover:text-amber-200'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px]">Friends</span>
        </button>
      </nav>
    </div>
  );
};

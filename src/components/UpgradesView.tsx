import React, { useState } from 'react';
import { User } from '../types';
import { upgradeApi } from '../lib/api';
import { Zap, Flame, Sparkles, ShieldAlert, Check } from 'lucide-react';

interface UpgradesViewProps {
  user: User | null;
  onUpdateUser: (user: User) => void;
  onOpenAuth: () => void;
}

export const UpgradesView: React.FC<UpgradesViewProps> = ({ user, onUpdateUser, onOpenAuth }) => {
  const [upgrading, setUpgrading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleUpgrade = async (type: 'energy' | 'hit') => {
    if (!user) {
      onOpenAuth();
      return;
    }

    setUpgrading(true);
    const res = await upgradeApi(user.id, type);
    setUpgrading(false);

    if (res.success && res.user) {
      onUpdateUser(res.user);
      setMessage(`Upgrade Successful! New level applied.`);
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage(res.error || 'Upgrade failed!');
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const energyCost = user ? user.energyLevel * 100 : 100;
  const hitCost = user ? user.hitLevel * 150 : 150;

  return (
    <div className="flex flex-col gap-4 px-4 pt-2 pb-24 text-amber-50">
      {/* Title */}
      <div className="bg-gradient-to-r from-[#38261e] to-[#261914] p-4 rounded-3xl border border-[#52382c]/80 shadow-xl flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-amber-100 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <span>BOOST & UPGRADES</span>
          </h2>
          <p className="text-xs text-amber-300/70 mt-1">
            Spend $NXB coins to permanently upgrade Charge Box capacity and Hit Damage per tap!
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xl">
          ⚡
        </div>
      </div>

      {message && (
        <div className="bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs p-3 rounded-2xl flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{message}</span>
        </div>
      )}

      {/* Charge Box Upgrade Card */}
      <div className="bg-[#2a1d18]/90 p-4 rounded-3xl border border-[#4a342b] flex items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Zap className="w-6 h-6 fill-amber-400" />
          </div>

          <div>
            <h3 className="font-bold text-sm text-amber-100 flex items-center gap-2">
              <span>Charge Box Upgrade</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                Lvl {user ? user.energyLevel : 1}
              </span>
            </h3>
            <p className="text-xs text-amber-300/70 mt-0.5">
              +500 Max Energy ({user ? user.maxEnergy : 1000} → {user ? user.maxEnergy + 500 : 1500} ⚡)
            </p>
          </div>
        </div>

        <button
          onClick={() => handleUpgrade('energy')}
          disabled={upgrading || (user ? user.balance < energyCost : false)}
          className="bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black text-xs px-4 py-2.5 rounded-2xl hover:from-amber-400 hover:to-orange-400 transition-all disabled:opacity-40 cursor-pointer shadow-md active:scale-95 flex flex-col items-center"
        >
          <span>Upgrade</span>
          <span className="text-[10px] opacity-80 font-mono">{energyCost} $NXB</span>
        </button>
      </div>

      {/* Hit Damage Upgrade Card */}
      <div className="bg-[#2a1d18]/90 p-4 rounded-3xl border border-[#4a342b] flex items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
            <Flame className="w-6 h-6 fill-orange-400" />
          </div>

          <div>
            <h3 className="font-bold text-sm text-amber-100 flex items-center gap-2">
              <span>Hit Damage Upgrade</span>
              <span className="text-[10px] bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded-full font-bold">
                Lvl {user ? user.hitLevel : 1}
              </span>
            </h3>
            <p className="text-xs text-amber-300/70 mt-0.5">
              +0.5 $NXB/tap ({user ? user.hitDamage : 0.5} → {user ? user.hitDamage + 0.5 : 1.0} per tap)
            </p>
          </div>
        </div>

        <button
          onClick={() => handleUpgrade('hit')}
          disabled={upgrading || (user ? user.balance < hitCost : false)}
          className="bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black text-xs px-4 py-2.5 rounded-2xl hover:from-amber-400 hover:to-orange-400 transition-all disabled:opacity-40 cursor-pointer shadow-md active:scale-95 flex flex-col items-center"
        >
          <span>Upgrade</span>
          <span className="text-[10px] opacity-80 font-mono">{hitCost} $NXB</span>
        </button>
      </div>
    </div>
  );
};

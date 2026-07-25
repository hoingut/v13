import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { syncUserApi } from '../lib/api';
import confetti from 'canvas-confetti';
import { Zap, ShieldAlert, Sparkles, Flame, Clock } from 'lucide-react';

import hedgehogImg from '../assets/images/hedgehog_mascot_1784869809278.jpg';
import coinImg from '../assets/images/nxb_golden_coin_1784869821261.jpg';

interface AirdropTapGameProps {
  user: User | null;
  onUpdateUser: (user: User) => void;
  onOpenAuth: () => void;
  onOpenUpgrades: () => void;
}

interface FloatingTap {
  id: number;
  x: number;
  y: number;
  value: string;
}

export const AirdropTapGame: React.FC<AirdropTapGameProps> = ({
  user,
  onUpdateUser,
  onOpenAuth,
  onOpenUpgrades,
}) => {
  const [floatingTaps, setFloatingTaps] = useState<FloatingTap[]>([]);
  const [isTapping, setIsTapping] = useState(false);
  const [rechargeTimeLeft, setRechargeTimeLeft] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 6-hour energy recharge calculation countdown display
  useEffect(() => {
    const timer = setInterval(() => {
      if (!user) return;
      if (user.energy >= user.maxEnergy) {
        setRechargeTimeLeft('Full Charge ⚡');
        return;
      }
      // Calculate time needed for full charge (6h max = 21600 seconds)
      const missingEnergy = user.maxEnergy - user.energy;
      const secondsNeeded = Math.ceil(missingEnergy * (21600 / user.maxEnergy));
      const h = Math.floor(secondsNeeded / 3600);
      const m = Math.floor((secondsNeeded % 3600) / 60);
      const s = secondsNeeded % 60;
      setRechargeTimeLeft(`${h}h ${m}m ${s}s to full`);
    }, 1000);

    return () => clearInterval(timer);
  }, [user]);

  // Handle Tap Action
  const handleTap = async (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!user) {
      onOpenAuth();
      return;
    }

    if (user.energy < 1) {
      setErrorMessage('Charge box empty! It recharges automatically over 6 hours or upgrade Charge Box.');
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    // Calculate click coordinates for floating coin animation
    const rect = e.currentTarget.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const tapValue = `+${user.hitDamage} $NXB`;
    const tapId = Date.now() + Math.random();

    setFloatingTaps(prev => [...prev, { id: tapId, x, y, value: tapValue }]);
    setIsTapping(true);
    setTimeout(() => setIsTapping(false), 150);

    // Remove floating tap after 1 sec
    setTimeout(() => {
      setFloatingTaps(prev => prev.filter(t => t.id !== tapId));
    }, 900);

    // Optimistic local update
    const damage = user.hitDamage;
    const updatedUser = { ...user };
    updatedUser.energy = Math.max(0, updatedUser.energy - 1);
    updatedUser.balance += damage;
    updatedUser.subjectHp -= damage;

    let isLevelUp = false;
    if (updatedUser.subjectHp <= 0) {
      isLevelUp = true;
      updatedUser.subjectLevel += 1;
      updatedUser.subjectMaxHp = updatedUser.subjectLevel * 100;
      updatedUser.subjectHp = updatedUser.subjectMaxHp;
      // Trigger level up blast!
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#f97316', '#eab308', '#ffffff'],
      });
    }

    onUpdateUser(updatedUser);

    // Debounced database sync (sync 2s after tapping stops, or immediately if level up)
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    if (isLevelUp) {
      syncUserApi(updatedUser.id, updatedUser);
    } else {
      syncTimeoutRef.current = setTimeout(() => {
        syncUserApi(updatedUser.id, updatedUser);
      }, 2000);
    }
  };

  const hpPercent = user ? Math.max(0, Math.min(100, Math.round((user.subjectHp / user.subjectMaxHp) * 100))) : 100;
  const energyPercent = user ? Math.max(0, Math.min(100, Math.round((user.energy / user.maxEnergy) * 100))) : 100;

  return (
    <div className="flex flex-col items-center justify-between min-h-[78vh] px-4 py-3 relative text-amber-50 select-none">
      
      {/* Top $NXB Score Board - Luxury Golden Box */}
      <div className="w-full flex flex-col items-center gap-2 my-1">
        
        {/* Golden Mining Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border border-amber-400/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-300">Official $NXB Mining Phase</span>
        </div>

        {/* Golden Score Card with Inner Glow & Depth */}
        <div className="w-full max-w-sm flex items-center justify-between bg-gradient-to-b from-[#3a2217]/95 via-[#26140d]/95 to-[#150a06]/95 backdrop-blur-xl px-6 py-3.5 rounded-3xl border-t border-t-amber-400/60 border-x border-x-amber-500/30 border-b border-b-black/80 shadow-[0_15px_35px_rgba(0,0,0,0.8),0_0_20px_rgba(245,158,11,0.15)] relative overflow-hidden group">
          {/* Subtle Background Glow Ring */}
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/20 transition-all" />

          <div className="flex items-center gap-3.5">
            <div className="relative">
              <div className="absolute inset-0 bg-amber-400 rounded-full blur-md opacity-40 animate-pulse" />
              <img
                src={coinImg}
                alt="NXB Coin"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="%23f59e0b"><circle cx="12" cy="12" r="10" stroke="%23fbbf24" stroke-width="2"/><text x="12" y="16" font-size="12" font-weight="bold" text-anchor="middle" fill="%23000">NXB</text></svg>';
                }}
                className="relative w-12 h-12 rounded-full shadow-2xl border-2 border-amber-300/80 object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400/90 flex items-center gap-1">
                <span>$NXB Balance Score</span>
              </span>
              <span className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-white to-amber-300 font-mono drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                {user ? user.balance.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : '0.0'}
              </span>
            </div>
          </div>

          <div className="text-right flex flex-col items-end">
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded-full shadow-sm">
              +{(user ? user.hitDamage : 0.5)} / Tap
            </span>
            <span className="text-[9px] text-amber-300/60 mt-1 font-mono">Live Mining</span>
          </div>
        </div>

        {/* Level & Subject HP Header Card with Embossed Styling */}
        <div className="w-full max-w-sm px-4 py-2.5 bg-gradient-to-r from-[#2a170f]/90 via-[#1f110b]/90 to-[#2a170f]/90 rounded-2xl border-t border-t-orange-500/40 border-x border-x-orange-500/20 border-b border-b-black/60 shadow-lg flex flex-col gap-1.5 relative overflow-hidden">
          <div className="flex justify-between items-center text-xs font-black text-amber-100">
            <span className="flex items-center gap-1.5 bg-[#170a06] px-2.5 py-0.5 rounded-xl border border-amber-500/30 text-amber-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400/40" />
              <span>Subject Level {user ? user.subjectLevel : 1}</span>
            </span>
            <span className="text-orange-400 font-mono font-black drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]">
              {user ? Math.round(user.subjectHp) : 100} / {user ? user.subjectMaxHp : 100} HP
            </span>
          </div>
          {/* Rich HP Bar with Shimmer Tip */}
          <div className="w-full h-3 bg-[#110805] rounded-full overflow-hidden p-0.5 border border-[#4a2b1d] shadow-inner relative">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-600 via-orange-500 to-amber-300 transition-all duration-300 shadow-[0_0_10px_#f59e0b] relative"
              style={{ width: `${hpPercent}%` }}
            >
              <div className="absolute right-0 top-0 bottom-0 w-2 bg-white rounded-full blur-[1px] opacity-75 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Error / Alert Toast */}
      {errorMessage && (
        <div className="absolute top-36 z-30 bg-gradient-to-r from-rose-950 via-rose-900 to-rose-950 border-2 border-rose-500 text-rose-100 text-xs px-5 py-2.5 rounded-2xl shadow-[0_10px_25px_rgba(244,63,94,0.5)] flex items-center gap-2.5 animate-bounce font-bold">
          <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Center Tap Subject Mascot with Radiant Rings */}
      <div className="relative flex flex-col items-center my-auto cursor-pointer py-2">
        {/* Glow halo background */}
        <div className="absolute w-72 h-72 bg-gradient-to-tr from-amber-600/25 to-orange-500/25 rounded-full blur-3xl pointer-events-none animate-pulse" />

        {/* Tap Container Surface */}
        <div
          onClick={handleTap}
          className={`relative w-64 h-64 rounded-full flex items-center justify-center transition-all duration-150 transform active:scale-95 ${
            isTapping ? 'scale-90 rotate-1 ring-8 ring-amber-400/70 shadow-[0_0_50px_rgba(245,158,11,0.8)]' : 'hover:scale-105 shadow-[0_0_35px_rgba(245,158,11,0.35)]'
          }`}
        >
          {/* Outer Decorative Rings */}
          <div className="absolute -inset-3 rounded-full border-2 border-dashed border-amber-500/30 animate-[spin_25s_linear_infinite] pointer-events-none" />
          <div className="absolute -inset-1 rounded-full border border-amber-400/40 animate-[spin_15s_linear_infinite_reverse] pointer-events-none" />

          {/* Subject Mascot Image Box with Luxury Bezel */}
          <div className="w-56 h-56 rounded-full overflow-hidden border-[5px] border-[#5e3c28] shadow-[0_15px_35px_rgba(0,0,0,0.9),inset_0_4px_10px_rgba(255,255,255,0.2)] relative bg-gradient-to-b from-[#3d2922] to-[#1c120e] flex items-center justify-center group">
            <img
              src={hedgehogImg}
              alt="HedHog Mascot Subject"
              onError={(e) => {
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  e.currentTarget.style.display = 'none';
                  const svgFallback = document.createElement('div');
                  svgFallback.className = 'w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-amber-600 via-orange-600 to-amber-800 text-white p-4 text-center';
                  svgFallback.innerHTML = `
                    <div class="text-5xl mb-1">🦔</div>
                    <div class="font-black text-sm tracking-widest text-amber-200 uppercase">Hedgehog Mascot</div>
                    <div class="text-[10px] text-amber-300 font-mono">Tap To Earn $NXB</div>
                  `;
                  parent.appendChild(svgFallback);
                }
              }}
              className="w-full h-full object-cover pointer-events-none drop-shadow-2xl group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-white/10 pointer-events-none" />
          </div>

          {/* Floating Tap Text Elements */}
          {floatingTaps.map(t => (
            <div
              key={t.id}
              className="absolute pointer-events-none font-black text-2xl text-amber-300 drop-shadow-[0_2px_10px_rgba(245,158,11,1)] animate-floatUp font-mono z-20"
              style={{ left: `${t.x}px`, top: `${t.y}px` }}
            >
              {t.value}
            </div>
          ))}
        </div>

        {/* Tap Helper Badge */}
        <div className="mt-4 bg-gradient-to-r from-[#331e15] via-[#24150e] to-[#331e15] px-4 py-1.5 rounded-full border border-amber-500/40 shadow-lg flex items-center gap-2 text-xs font-extrabold text-amber-200">
          <Flame className="w-4 h-4 text-orange-400 animate-bounce" />
          <span>Tap Mascot To Deal Damage & Earn $NXB</span>
          <Flame className="w-4 h-4 text-orange-400 animate-bounce" />
        </div>
      </div>

      {/* Bottom Charge Box Energy Card - High-Tech Golden Console */}
      <div className="w-full max-w-sm mb-16 bg-gradient-to-b from-[#331e15]/95 via-[#22130d]/95 to-[#140a07]/95 backdrop-blur-xl p-4 rounded-3xl border-t border-t-amber-400/60 border-x border-x-amber-500/30 border-b border-b-black/80 shadow-[0_15px_35px_rgba(0,0,0,0.8),0_0_25px_rgba(245,158,11,0.15)] flex flex-col gap-2.5 relative overflow-hidden">
        {/* Decorative corner glow */}
        <div className="absolute -left-6 -bottom-6 w-20 h-20 bg-orange-500/10 rounded-full blur-xl pointer-events-none" />

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 font-black text-amber-100">
            <div className="w-7 h-7 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-sm">
              <Zap className="w-4 h-4 fill-amber-400 animate-pulse" />
            </div>
            <span>Energy Charge Box</span>
            <span className="text-[10px] bg-gradient-to-r from-amber-500 to-orange-500 text-black px-2 py-0.5 rounded-full font-black shadow-sm">
              Lvl {user ? user.energyLevel : 1}
            </span>
          </div>

          <div className="text-xs font-mono font-black text-amber-300 bg-[#160b07] px-2.5 py-1 rounded-xl border border-amber-500/30 shadow-inner">
            {user ? user.energy : 1000} / {user ? user.maxEnergy : 1000} ⚡
          </div>
        </div>

        {/* Energy Progress Bar with Shimmer */}
        <div className="w-full h-3.5 bg-[#120805] rounded-full overflow-hidden border border-[#482a1d] shadow-inner p-0.5 relative">
          <div
            className="h-full bg-gradient-to-r from-amber-600 via-orange-500 to-amber-300 transition-all duration-300 rounded-full shadow-[0_0_12px_#f59e0b] relative"
            style={{ width: `${energyPercent}%` }}
          >
            <div className="absolute right-0 top-0 bottom-0 w-2.5 bg-white rounded-full blur-[1px] opacity-80 animate-pulse" />
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-amber-300/80 pt-0.5 font-mono">
          <span className="flex items-center gap-1.5 bg-[#170c08] px-2.5 py-1 rounded-lg border border-[#3d2317]">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-bold">{rechargeTimeLeft}</span>
          </span>

          <button
            onClick={onOpenUpgrades}
            className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-400/50 text-amber-300 hover:text-white px-3 py-1 rounded-xl font-extrabold transition-all duration-200 shadow-sm cursor-pointer flex items-center gap-1"
          >
            <span>Boost Power →</span>
          </button>
        </div>
      </div>
    </div>
  );
};

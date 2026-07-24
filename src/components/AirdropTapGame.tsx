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
    <div className="flex flex-col items-center justify-between min-h-[78vh] px-4 py-2 relative text-amber-50 select-none">
      {/* Top $NXB Score Board */}
      <div className="w-full flex flex-col items-center gap-1 my-2">
        <div className="flex items-center gap-3 bg-[#2c1d18]/90 backdrop-blur-xl px-5 py-2.5 rounded-3xl border border-[#543b30]/80 shadow-2xl">
          <img
            src={coinImg}
            alt="NXB Coin"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="%23f59e0b"><circle cx="12" cy="12" r="10" stroke="%23fbbf24" stroke-width="2"/><text x="12" y="16" font-size="12" font-weight="bold" text-anchor="middle" fill="%23000">NXB</text></svg>';
            }}
            className="w-10 h-10 rounded-full shadow-lg border border-amber-400/50 animate-pulse object-cover"
          />
          <div className="flex flex-col">
            <span className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-100 to-amber-400 font-mono">
              {user ? user.balance.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : '0.0'}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400/80">
              $NXB Coin Score
            </span>
          </div>
        </div>

        {/* Level & Subject HP Header */}
        <div className="w-full max-w-xs mt-2 px-3 py-2 bg-[#251814]/70 rounded-2xl border border-[#442e25]/60 flex flex-col gap-1.5">
          <div className="flex justify-between items-center text-xs font-bold text-amber-200/90">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Subject Level {user ? user.subjectLevel : 1}</span>
            </span>
            <span className="text-amber-400 font-mono">
              {user ? Math.round(user.subjectHp) : 100} / {user ? user.subjectMaxHp : 100} HP
            </span>
          </div>
          {/* HP Bar */}
          <div className="w-full h-2.5 bg-[#170e0b] rounded-full overflow-hidden p-0.5 border border-[#3d271f]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 transition-all duration-300 shadow-sm shadow-orange-500/50"
              style={{ width: `${hpPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Error / Alert Toast */}
      {errorMessage && (
        <div className="absolute top-28 z-30 bg-rose-950/90 border border-rose-500/80 text-rose-200 text-xs px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Center Tap Subject Mascot */}
      <div className="relative flex flex-col items-center my-auto cursor-pointer">
        {/* Glow halo background */}
        <div className="absolute w-64 h-64 bg-amber-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" />

        {/* Tap Container Surface */}
        <div
          onClick={handleTap}
          className={`relative w-64 h-64 rounded-full flex items-center justify-center transition-all duration-150 transform active:scale-95 ${
            isTapping ? 'scale-90 rotate-1 ring-4 ring-amber-400/60 shadow-orange-500/80' : 'hover:scale-105'
          }`}
        >
          {/* Outer Decorative Ring */}
          <div className="absolute inset-0 rounded-full border-4 border-dashed border-amber-500/30 animate-[spin_20s_linear_infinite] pointer-events-none" />

          {/* Subject Mascot Image */}
          <div className="w-56 h-56 rounded-full overflow-hidden border-4 border-[#52382c] shadow-2xl relative bg-gradient-to-b from-[#3d2922] to-[#1c120e] flex items-center justify-center">
            <img
              src={hedgehogImg}
              alt="HedHog Mascot Subject"
              onError={(e) => {
                // Inline golden hedgehog SVG fallback if asset load fails
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
              className="w-full h-full object-cover pointer-events-none drop-shadow-2xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Floating Tap Text Elements */}
          {floatingTaps.map(t => (
            <div
              key={t.id}
              className="absolute pointer-events-none font-black text-xl text-amber-300 drop-shadow-[0_2px_8px_rgba(245,158,11,0.9)] animate-floatUp font-mono"
              style={{ left: `${t.x}px`, top: `${t.y}px` }}
            >
              {t.value}
            </div>
          ))}
        </div>

        <p className="mt-3 text-xs text-amber-300/80 font-medium flex items-center gap-1 bg-[#281b16]/80 px-3 py-1 rounded-full border border-[#483228]">
          <Flame className="w-3.5 h-3.5 text-orange-400" />
          <span>Tap hedgehog to deal damage & earn $NXB</span>
        </p>
      </div>

      {/* Bottom Charge Box Energy Bar */}
      <div className="w-full max-w-sm mb-16 bg-[#251814]/90 backdrop-blur-md p-3 rounded-2xl border border-[#483228]/80 shadow-xl flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-bold text-amber-200">
            <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>Charge Box</span>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-semibold border border-amber-500/30">
              Lvl {user ? user.energyLevel : 1}
            </span>
          </div>

          <div className="text-xs font-mono font-bold text-amber-300">
            {user ? user.energy : 1000} / {user ? user.maxEnergy : 1000} ⚡
          </div>
        </div>

        {/* Energy Progress Bar */}
        <div className="w-full h-3 bg-[#180e0b] rounded-full overflow-hidden border border-[#3d271f] relative">
          <div
            className="h-full bg-gradient-to-r from-amber-500 via-orange-400 to-amber-300 transition-all duration-300 rounded-full shadow-md"
            style={{ width: `${energyPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-amber-300/70 pt-0.5 font-mono">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>{rechargeTimeLeft}</span>
          </span>

          <button
            onClick={onOpenUpgrades}
            className="text-orange-400 hover:text-orange-300 font-bold underline cursor-pointer"
          >
            Boost Charge & Hit Damage →
          </button>
        </div>
      </div>
    </div>
  );
};

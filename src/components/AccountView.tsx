import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { claimDailyCheckInApi, uploadAvatarApi } from '../lib/api';
import {
  User as UserIcon,
  ShieldCheck,
  Copy,
  Check,
  LogOut,
  Sparkles,
  Gift,
  Flame,
  Clock,
  CheckCircle,
  ArrowRight,
  Send,
  MessageCircle,
  AlertTriangle,
  ShieldAlert,
  Lock,
  CheckCircle2,
  Camera,
  Loader2
} from 'lucide-react';

interface AccountViewProps {
  user: User | null;
  onUpdateUser?: (updatedUser: User) => void;
  onOpenAuth: () => void;
  onOpenWithdraw: () => void;
  onOpenAdmin: () => void;
  onLogout: () => void;
}

const STREAK_DAYS = [
  { day: 1, reward: 500 },
  { day: 2, reward: 1000 },
  { day: 3, reward: 2500 },
  { day: 4, reward: 5000 },
  { day: 5, reward: 10000 },
  { day: 6, reward: 15000 },
  { day: 7, reward: 25000, bonus: '⚡ +100 Energy' },
];

export const AccountView: React.FC<AccountViewProps> = ({
  user,
  onUpdateUser,
  onOpenAuth,
  onOpenWithdraw,
  onOpenAdmin,
  onLogout,
}) => {
  const [copied, setCopied] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [claimToast, setClaimToast] = useState<{ message: string; isError?: boolean } | null>(null);

  // Real-time Countdown Timer until midnight (12 AM)
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const diff = Math.max(0, tomorrow.getTime() - now.getTime());

      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ hours, minutes, seconds });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!user) {
    return (
      <div className="p-6 text-center text-amber-50 my-10 bg-[#241713] rounded-3xl border border-[#4a352b] max-w-sm mx-auto shadow-xl">
        <UserIcon className="w-12 h-12 text-amber-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold">Log in to Access Account</h3>
        <p className="text-xs text-amber-300/70 mt-1 mb-4">
          Please log in to check your account details, referral link & balances.
        </p>
        <button
          onClick={onOpenAuth}
          className="bg-amber-500 text-black px-6 py-2.5 rounded-2xl font-black text-xs shadow-lg hover:bg-amber-400 cursor-pointer"
        >
          Login with Gmail
        </button>
      </div>
    );
  }

  const referralLink = `${window.location.origin}?ref=${user.referralCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const isClaimedToday = user.lastCheckInDate === todayStr;
  const currentStreak = user.checkInStreak || 0;
  const activeDayIndex = isClaimedToday ? currentStreak : (currentStreak % 7) + 1;

  const handleDirectClaim = async () => {
    if (isClaimedToday || claiming) return;
    setClaiming(true);
    setClaimToast(null);

    try {
      const res = await claimDailyCheckInApi(user.id);
      setClaiming(false);

      if (res.success && res.user) {
        if (onUpdateUser) onUpdateUser(res.user);
        setClaimToast({ message: res.message });
      } else {
        setClaimToast({ message: res.error || 'Claim failed', isError: true });
      }
    } catch (err) {
      setClaiming(false);
      setClaimToast({ message: 'Network error claiming daily bonus', isError: true });
    }
  };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    setClaimToast(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      try {
        const res = await uploadAvatarApi(user.id, base64);
        setUploadingAvatar(false);
        if (res.success && res.user) {
          if (onUpdateUser) onUpdateUser(res.user);
          setClaimToast({ message: 'Profile picture updated successfully! 📸' });
        } else {
          setClaimToast({ message: res.error || 'Avatar upload failed', isError: true });
        }
      } catch (err) {
        setUploadingAvatar(false);
        setClaimToast({ message: 'Network error uploading profile picture', isError: true });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col gap-4 px-4 pt-2 pb-24 text-amber-50">
      {/* Profile Overview Banner with Profile Picture Upload */}
      <div className="bg-gradient-to-br from-[#2f1f19] via-[#241713] to-[#180e0a] p-5 rounded-3xl border border-[#4d362c] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-4">
          {/* Avatar with Camera Overlay Trigger */}
          <div className="relative group shrink-0">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-16 h-16 rounded-2xl object-cover shadow-xl border-2 border-amber-400/50"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white font-black text-2xl shadow-xl border border-amber-400/30">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}

            {/* Profile Picture Upload Button Input Overlay */}
            <label className="absolute -bottom-1 -right-1 bg-amber-500 hover:bg-amber-400 text-black p-1.5 rounded-xl shadow-lg border border-amber-200 cursor-pointer transition-transform active:scale-90 flex items-center justify-center">
              {uploadingAvatar ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Camera className="w-3.5 h-3.5" />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarFileChange}
                disabled={uploadingAvatar}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-black text-amber-100 truncate">{user.name}</h2>
            <p className="text-xs text-amber-300/70 font-mono truncate">{user.email}</p>

            <div className="flex items-center gap-2 mt-2">
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Gmail Verified</span>
              </span>
              {user.role === 'admin' && (
                <span className="bg-orange-500/30 text-orange-300 border border-orange-500/50 text-[10px] px-2 py-0.5 rounded-full font-bold">
                  ADMIN
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Visual Daily Check-in Streak & Real-Time Countdown Card */}
      <div className="bg-gradient-to-br from-[#2b1913] via-[#20120d] to-[#150a07] p-4 rounded-3xl border border-amber-500/40 shadow-2xl space-y-3 relative overflow-hidden">
        {/* Top Streak Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[#3d271e]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
              <Flame className="w-4 h-4 fill-orange-400 animate-bounce" />
            </div>
            <div>
              <h3 className="text-xs font-black text-amber-100 flex items-center gap-1">
                <span>Daily Login Streak</span>
                <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
              </h3>
              <p className="text-[10px] text-amber-300/70">
                {currentStreak} Day{currentStreak === 1 ? '' : 's'} Active Streak
              </p>
            </div>
          </div>

          {/* Real-time Countdown Timer Badge */}
          <div className="bg-[#140b08] px-3 py-1.5 rounded-2xl border border-amber-500/30 text-center">
            <div className="text-[9px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1 justify-center">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>Next Bonus In</span>
            </div>
            <div className="text-xs font-black text-amber-200 font-mono tracking-wider">
              {String(timeLeft.hours).padStart(2, '0')}h : {String(timeLeft.minutes).padStart(2, '0')}m : {String(timeLeft.seconds).padStart(2, '0')}s
            </div>
          </div>
        </div>

        {/* Visual Progress Bar (Day 1 to Day 7) */}
        <div>
          <div className="flex justify-between items-center text-[10px] font-bold text-amber-300/80 mb-1.5">
            <span>Streak Progress</span>
            <span className="font-mono text-amber-400">Day {activeDayIndex} / 7</span>
          </div>

          {/* Visual Bar Track */}
          <div className="w-full h-3 bg-[#130b08] rounded-full border border-[#3e271d] overflow-hidden p-0.5 relative">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 rounded-full transition-all duration-500 shadow-lg"
              style={{ width: `${Math.min(100, Math.max(14, (currentStreak / 7) * 100))}%` }}
            />
          </div>
        </div>

        {/* Calendar Day Grid */}
        <div className="grid grid-cols-7 gap-1.5 pt-1">
          {STREAK_DAYS.map(item => {
            const isDone = currentStreak >= item.day || (isClaimedToday && currentStreak === item.day);
            const isCurrentActive = !isClaimedToday && (currentStreak % 7 + 1) === item.day;

            return (
              <div
                key={item.day}
                className={`p-1.5 rounded-xl border flex flex-col items-center justify-between text-center transition-all ${
                  isDone
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                    : isCurrentActive
                    ? 'bg-gradient-to-b from-amber-500/40 to-orange-600/30 border-amber-400 ring-1 ring-amber-400/50 text-white scale-102'
                    : 'bg-[#140b08] border-[#38241b] text-amber-200/40'
                }`}
              >
                <span className="text-[9px] font-extrabold uppercase">D{item.day}</span>
                <div className="my-1">
                  {isDone ? (
                    <CheckCircle className="w-4 h-4 text-amber-400 fill-amber-400/30" />
                  ) : (
                    <Gift className={`w-4 h-4 ${isCurrentActive ? 'text-amber-300 animate-pulse' : 'text-amber-400/40'}`} />
                  )}
                </div>
                <span className="text-[8px] font-mono font-black">
                  +{item.reward >= 1000 ? `${item.reward / 1000}k` : item.reward}
                </span>
              </div>
            );
          })}
        </div>

        {/* Action Claim / Status Toast */}
        {claimToast && (
          <div
            className={`p-2 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 ${
              claimToast.isError ? 'bg-rose-950/80 text-rose-200 border border-rose-500/50' : 'bg-emerald-950/80 text-emerald-200 border border-emerald-500/50'
            }`}
          >
            <span>{claimToast.message}</span>
          </div>
        )}

        <button
          onClick={handleDirectClaim}
          disabled={isClaimedToday || claiming}
          className={`w-full py-2.5 px-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer ${
            isClaimedToday
              ? 'bg-[#180f0b] border border-[#38241b] text-amber-200/50 cursor-not-allowed'
              : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-black border border-amber-300 active:scale-98'
          }`}
        >
          {claiming ? (
            <span>Claiming Reward...</span>
          ) : isClaimedToday ? (
            <>
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Claimed Today ✓ (Next bonus at Midnight)</span>
            </>
          ) : (
            <>
              <Gift className="w-4 h-4" />
              <span>Claim Day {activeDayIndex} Bonus Reward</span>
            </>
          )}
        </button>
      </div>

      {/* Official Telegram Channel & Support Section */}
      <div className="grid grid-cols-2 gap-3">
        <a
          href="https://t.me/xnrewared"
          target="_blank"
          rel="noreferrer"
          className="bg-gradient-to-br from-[#381e13] via-[#24130b] to-[#150a06] p-4 rounded-3xl border-t border-t-orange-400/60 border-x border-x-orange-500/30 border-b border-b-black/80 shadow-[0_10px_25px_rgba(0,0,0,0.7),0_0_15px_rgba(249,115,22,0.15)] flex flex-col justify-between hover:scale-102 transition-all group relative overflow-hidden"
        >
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-orange-500/10 rounded-full blur-xl pointer-events-none" />
          <div>
            <div className="flex items-center gap-2 text-orange-400 mb-1">
              <div className="p-1 rounded-lg bg-orange-500/20 border border-orange-400/40">
                <Send className="w-3.5 h-3.5 text-orange-400 group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-xs font-black">Official Channel</span>
            </div>
            <p className="text-[10px] text-amber-200/80 mt-1">Join for daily updates & promo codes</p>
          </div>
          <div className="mt-3 text-[10px] font-mono font-black text-orange-300 flex items-center gap-1 bg-[#160b06] px-2 py-1 rounded-xl border border-orange-500/30 w-fit">
            <span>t.me/xnrewared</span>
            <ArrowRight className="w-3 h-3 text-orange-400" />
          </div>
        </a>

        <a
          href="https://t.me/xnhelpline"
          target="_blank"
          rel="noreferrer"
          className="bg-gradient-to-br from-[#0e2938] via-[#091a24] to-[#050e14] p-4 rounded-3xl border-t border-t-[#38bdf8]/60 border-x border-x-[#0088cc]/30 border-b border-b-black/80 shadow-[0_10px_25px_rgba(0,0,0,0.7),0_0_15px_rgba(56,189,248,0.15)] flex flex-col justify-between hover:scale-102 transition-all group relative overflow-hidden"
        >
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-[#38bdf8]/10 rounded-full blur-xl pointer-events-none" />
          <div>
            <div className="flex items-center gap-2 text-[#38bdf8] mb-1">
              <div className="p-1 rounded-lg bg-[#38bdf8]/20 border border-[#38bdf8]/40">
                <MessageCircle className="w-3.5 h-3.5 text-[#38bdf8] group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-xs font-black">24/7 Helpline</span>
            </div>
            <p className="text-[10px] text-sky-200/80 mt-1">Direct Telegram admin support</p>
          </div>
          <div className="mt-3 text-[10px] font-mono font-black text-[#38bdf8] flex items-center gap-1 bg-[#061219] px-2 py-1 rounded-xl border border-[#38bdf8]/30 w-fit">
            <span>@xnhelpline</span>
            <ArrowRight className="w-3 h-3 text-[#38bdf8]" />
          </div>
        </a>
      </div>

      {/* Dual Balances & Cash Value */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-b from-[#331e15] via-[#22130d] to-[#140a07] p-4 rounded-3xl border-t border-t-amber-400/60 border-x border-x-amber-500/30 border-b border-b-black/80 shadow-[0_10px_25px_rgba(0,0,0,0.7),0_0_15px_rgba(245,158,11,0.1)] flex flex-col justify-between relative overflow-hidden">
          <div>
            <span className="text-[10px] font-black text-amber-300/80 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Coins Balance</span>
            </span>
            <div className="text-2xl font-black text-amber-400 font-mono mt-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              {user.balance.toLocaleString()}
            </div>
          </div>
          <span className="text-[10px] text-amber-300/70 mt-2 bg-[#170b07] px-2 py-1 rounded-xl border border-amber-500/30 font-mono w-fit">
            1k Coin = ৳2 Taka
          </span>
        </div>

        <div className="bg-gradient-to-b from-emerald-900/90 via-[#13241d] to-[#0a1410] p-4 rounded-3xl border-t border-t-emerald-400/60 border-x border-x-emerald-500/30 border-b border-b-black/80 shadow-[0_10px_25px_rgba(0,0,0,0.7),0_0_15px_rgba(16,185,129,0.15)] flex flex-col justify-between relative overflow-hidden">
          <div>
            <span className="text-[10px] font-black text-emerald-300 uppercase tracking-wider flex items-center gap-1">
              <Gift className="w-3 h-3 text-emerald-400" />
              <span>Taka Balance (Tasks/Refs)</span>
            </span>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              ৳ {(user.takaBalance || 0).toLocaleString()} BDT
            </div>
          </div>
          <button
            onClick={onOpenWithdraw}
            className="mt-2 text-[10px] font-extrabold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-3 py-1.5 rounded-xl flex items-center justify-center gap-1 shadow-md cursor-pointer active:scale-95 transition-all"
          >
            <span>Withdraw Cash</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Referral Link & 10 Taka Reward Banner */}
      <div className="bg-gradient-to-br from-[#382015] via-[#24140e] to-[#150a06] p-5 rounded-3xl border-t border-t-amber-400/60 border-x border-x-amber-500/30 border-b border-b-black/80 shadow-[0_15px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(245,158,11,0.15)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center gap-2.5 mb-2">
          <div className="p-1.5 rounded-xl bg-amber-500/20 border border-amber-400/40 shadow-sm">
            <Gift className="w-5 h-5 text-amber-400 animate-bounce" />
          </div>
          <h3 className="font-black text-sm text-amber-100">
            Refer Friends & Earn <span className="text-emerald-400 font-mono text-base font-black drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]">৳ 10 Taka</span> per Refer!
          </h3>
        </div>
        <p className="text-xs text-amber-200/80 mb-3.5 leading-relaxed">
          Share your link with friends. Get <strong className="text-amber-400 font-mono">5,000 Coins (10 Taka BDT)</strong> instant reward for each verified referral!
        </p>

        <div className="flex items-center gap-2 bg-[#140b07] p-2 rounded-2xl border border-[#4a2c1d] shadow-inner">
          <input
            type="text"
            readOnly
            value={referralLink}
            className="w-full bg-transparent text-amber-200 text-xs font-mono focus:outline-none px-2 select-all"
          />
          <button
            onClick={handleCopyLink}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black px-4 py-2 rounded-xl font-black text-xs flex items-center gap-1.5 shrink-0 shadow-md cursor-pointer active:scale-95 transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Link'}</span>
          </button>
        </div>
      </div>

      {/* Anti-Fraud Rules & Referral Policy Section */}
      <div className="bg-gradient-to-br from-[#2a1310] via-[#1a0c09] to-[#120705] p-5 rounded-3xl border-t border-t-rose-500/60 border-x border-x-rose-500/30 border-b border-b-black/80 shadow-[0_15px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(244,63,94,0.15)] space-y-3.5">
        <div className="flex items-center gap-2 text-rose-400 font-black text-xs uppercase tracking-wider bg-rose-950/60 px-3 py-1.5 rounded-xl border border-rose-500/30 w-fit">
          <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" />
          <span>Strict Security & Anti-Fraud Rules</span>
        </div>

        <div className="space-y-2.5 text-xs">
          <div className="flex items-start gap-2.5 bg-[#170a08] p-3 rounded-2xl border border-rose-900/50 shadow-inner">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-rose-200">VPN / Proxy Allowed?</span>
              <p className="text-[11px] text-rose-300/70">
                <strong className="text-rose-400">VPN ব্যবহার করা সম্পূর্ণ নিষেধ!</strong> VPN বা প্রক্সি ব্যবহার করলে অ্যাকাউন্ট স্থায়ীভাবে ব্লক বা ব্যান হয়ে যাবে।
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2 bg-[#170a08] p-2.5 rounded-2xl border border-rose-900/40">
            <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-200">1 Device = 1 Account Lock</span>
              <p className="text-[11px] text-amber-300/70">
                এক ডিভাইসে একের অধিক অ্যাকাউন্ট খোলা যাবে না। প্রত্যেক ডিভাইসের জন্য ১টি মাত্র অ্যাকাউন্ট নিবন্ধিত থাকবে।
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2 bg-[#170a08] p-2.5 rounded-2xl border border-rose-900/40">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-emerald-200">No Bots / Auto-Clickers / Hacks</span>
              <p className="text-[11px] text-emerald-300/70">
                বট, স্ক্রিপ্ট বা হ্যাক সফটওয়্যার ব্যবহার করা কঠোরভাবে নিষিদ্ধ। ধরা পড়লে জমানো সমস্ত টাকা ও কয়েন বাজেয়াপ্ত করা হবে।
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        {user.role === 'admin' && (
          <button
            onClick={onOpenAdmin}
            className="w-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-amber-500/30 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Open Admin Dashboard</span>
          </button>
        )}

        <button
          onClick={onLogout}
          className="w-full bg-rose-950/60 border border-rose-500/40 text-rose-200 font-bold py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-rose-900/60 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-rose-400" />
          <span>Log Out Account</span>
        </button>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { claimDailyCheckInApi } from '../lib/api';
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
  Calendar,
  CheckCircle,
  ArrowRight,
  Send,
  MessageCircle,
  AlertTriangle,
  ShieldAlert,
  Lock,
  CheckCircle2,
  Database,
  Code2
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

const FULL_PROJECT_SQL = `-- Full SQL Schema for XN Reward / NXB Application (PostgreSQL / Supabase Compatible)

-- 1. Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password TEXT DEFAULT '',
  role VARCHAR(20) DEFAULT 'user',
  balance NUMERIC(15, 2) DEFAULT 0, -- Coins Balance
  taka_balance NUMERIC(15, 2) DEFAULT 0, -- Taka Balance
  energy INT DEFAULT 1000,
  max_energy INT DEFAULT 1000,
  energy_level INT DEFAULT 1,
  hit_level INT DEFAULT 1,
  hit_damage NUMERIC(10, 2) DEFAULT 0.5,
  subject_level INT DEFAULT 1,
  subject_hp NUMERIC(15, 2) DEFAULT 100,
  subject_max_hp NUMERIC(15, 2) DEFAULT 100,
  referral_code VARCHAR(50) UNIQUE,
  referred_by VARCHAR(100),
  device_id VARCHAR(100),
  device_name VARCHAR(150),
  last_check_in_date VARCHAR(20),
  check_in_streak INT DEFAULT 0,
  avatar TEXT,
  is_banned BOOLEAN DEFAULT FALSE,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
  id VARCHAR(100) PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  reward NUMERIC(15, 2) DEFAULT 100,
  type VARCHAR(20) DEFAULT 'one_time',
  category VARCHAR(50) DEFAULT 'social',
  action_url TEXT,
  requires_proof BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Task Submissions Table
CREATE TABLE IF NOT EXISTS public.task_submissions (
  id VARCHAR(100) PRIMARY KEY,
  task_id VARCHAR(100) REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id VARCHAR(100) REFERENCES public.users(id) ON DELETE CASCADE,
  user_name VARCHAR(150),
  user_email VARCHAR(150),
  proof_image_url TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  rejection_reason TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP WITH TIME ZONE
);

-- 4. Withdrawal Records Table
CREATE TABLE IF NOT EXISTS public.withdrawal_records (
  id VARCHAR(100) PRIMARY KEY,
  user_id VARCHAR(100) REFERENCES public.users(id) ON DELETE CASCADE,
  user_name VARCHAR(150),
  user_email VARCHAR(150),
  withdraw_type VARCHAR(20) DEFAULT 'coins', -- 'coins' or 'taka'
  payment_method VARCHAR(50) NOT NULL, -- 'bKash' | 'Nagad' | 'Rocket' | 'Binance'
  account_number VARCHAR(100) NOT NULL,
  coins_amount NUMERIC(15, 2) DEFAULT 0,
  taka_amount NUMERIC(15, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP WITH TIME ZONE
);

-- 5. Referrals Table
CREATE TABLE IF NOT EXISTS public.referrals (
  id VARCHAR(100) PRIMARY KEY,
  referrer_id VARCHAR(100) REFERENCES public.users(id) ON DELETE CASCADE,
  referred_user_id VARCHAR(100) REFERENCES public.users(id) ON DELETE CASCADE,
  referred_user_name VARCHAR(150),
  referred_user_email VARCHAR(150),
  referred_device_id VARCHAR(100),
  referred_device_name VARCHAR(150),
  is_first_referral BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  verified_at TIMESTAMP WITH TIME ZONE
);

-- 6. OTP Verification Table
CREATE TABLE IF NOT EXISTS public.otps (
  id VARCHAR(100) PRIMARY KEY,
  email VARCHAR(150) NOT NULL,
  otp_code VARCHAR(10) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ensure all missing columns exist for existing deployments:
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS taka_balance NUMERIC(15, 2) DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_check_in_date VARCHAR(20);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS check_in_streak INT DEFAULT 0;
ALTER TABLE public.withdrawal_records ADD COLUMN IF NOT EXISTS withdraw_type VARCHAR(20) DEFAULT 'coins';
`;

export const AccountView: React.FC<AccountViewProps> = ({
  user,
  onUpdateUser,
  onOpenAuth,
  onOpenWithdraw,
  onOpenAdmin,
  onLogout,
}) => {
  const [copied, setCopied] = useState(false);
  const [sqlCopied, setSqlCopied] = useState(false);
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [claimToast, setClaimToast] = useState<{ message: string; isError?: boolean } | null>(null);

  // Real-time Countdown Timer until midnight
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

  const handleCopySql = () => {
    navigator.clipboard.writeText(FULL_PROJECT_SQL);
    setSqlCopied(true);
    setTimeout(() => setSqlCopied(false), 2000);
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

  return (
    <div className="flex flex-col gap-4 px-4 pt-2 pb-24 text-amber-50">
      {/* Profile Overview Banner */}
      <div className="bg-gradient-to-br from-[#2f1f19] via-[#241713] to-[#180e0a] p-5 rounded-3xl border border-[#4d362c] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white font-black text-2xl shadow-xl border border-amber-400/30 shrink-0">
            {user.name.charAt(0).toUpperCase()}
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

        {/* Action Claim Button directly inside AccountView */}
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
          className="bg-gradient-to-br from-[#2b170e] to-[#1c0f0a] p-3.5 rounded-3xl border border-orange-500/40 shadow-lg flex flex-col justify-between hover:border-orange-400 transition-all group"
        >
          <div>
            <div className="flex items-center gap-2 text-orange-400 mb-1">
              <Send className="w-4 h-4 text-orange-400 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-black">Official Channel</span>
            </div>
            <p className="text-[10px] text-amber-300/70">Join for daily updates & codes</p>
          </div>
          <div className="mt-2 text-[10px] font-mono font-bold text-orange-300 underline flex items-center gap-1">
            <span>t.me/xnrewared</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </a>

        <a
          href="https://t.me/xnhelpline"
          target="_blank"
          rel="noreferrer"
          className="bg-gradient-to-br from-[#0c2331] to-[#071722] p-3.5 rounded-3xl border border-[#0088cc]/40 shadow-lg flex flex-col justify-between hover:border-[#38bdf8] transition-all group"
        >
          <div>
            <div className="flex items-center gap-2 text-[#38bdf8] mb-1">
              <MessageCircle className="w-4 h-4 text-[#38bdf8] group-hover:scale-110 transition-transform" />
              <span className="text-xs font-black">24/7 Helpline</span>
            </div>
            <p className="text-[10px] text-sky-200/70">Direct Telegram admin support</p>
          </div>
          <div className="mt-2 text-[10px] font-mono font-bold text-[#38bdf8] underline flex items-center gap-1">
            <span>@xnhelpline</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </a>
      </div>

      {/* Dual Balances & Cash Value */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#241713] p-4 rounded-3xl border border-[#432f26] shadow-lg flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-amber-300/70 uppercase">Coins Balance</span>
            <div className="text-xl font-black text-amber-400 font-mono mt-1">
              {user.balance.toLocaleString()}
            </div>
          </div>
          <span className="text-[10px] text-amber-300/50 mt-2">1k Coin = ৳2 Taka</span>
        </div>

        <div className="bg-gradient-to-br from-emerald-950/80 to-[#19231f] p-4 rounded-3xl border border-emerald-500/30 shadow-lg flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-emerald-300 uppercase">Taka Balance (Tasks/Refs)</span>
            <div className="text-xl font-black text-emerald-400 font-mono mt-1">
              ৳ {(user.takaBalance || 0).toLocaleString()} BDT
            </div>
          </div>
          <button
            onClick={onOpenWithdraw}
            className="mt-2 text-[10px] font-bold text-emerald-300 underline flex items-center gap-1 hover:text-white cursor-pointer"
          >
            <span>Withdraw Cash</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Referral Link & 10 Taka Reward Banner */}
      <div className="bg-gradient-to-r from-[#2c1d18] to-[#1e130f] p-4 rounded-3xl border border-amber-500/30 shadow-xl">
        <div className="flex items-center gap-2 mb-2">
          <Gift className="w-5 h-5 text-amber-400" />
          <h3 className="font-extrabold text-sm text-amber-100">
            Refer Friends & Earn <span className="text-emerald-400 font-black">৳ 10 Taka</span> per Refer!
          </h3>
        </div>
        <p className="text-xs text-amber-300/70 mb-3">
          Share your link with friends. Get 5,000 Coins (10 Taka BDT) for each verified referral.
        </p>

        <div className="flex items-center gap-2 bg-[#140c0a] p-2 rounded-2xl border border-[#3d2921]">
          <input
            type="text"
            readOnly
            value={referralLink}
            className="w-full bg-transparent text-amber-200 text-xs font-mono focus:outline-none px-2"
          />
          <button
            onClick={handleCopyLink}
            className="bg-amber-500 text-black px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 shrink-0 hover:bg-amber-400 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Project Database SQL Viewer / Exporter */}
      <div className="bg-[#1f120d] p-4 rounded-3xl border border-amber-500/30 shadow-xl space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-300 text-xs font-bold">
            <Database className="w-4 h-4 text-amber-400" />
            <span>Full Project Database SQL Schema</span>
          </div>
          <button
            onClick={() => setShowSqlModal(!showSqlModal)}
            className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded-xl font-bold hover:bg-amber-500/30 cursor-pointer flex items-center gap-1"
          >
            <Code2 className="w-3 h-3" />
            <span>{showSqlModal ? 'Hide SQL' : 'View SQL'}</span>
          </button>
        </div>

        {showSqlModal && (
          <div className="mt-2 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-amber-300/70">PostgreSQL / Supabase compatible DDL script:</span>
              <button
                onClick={handleCopySql}
                className="bg-emerald-500 text-black px-3 py-1 rounded-xl font-bold text-[10px] flex items-center gap-1 hover:bg-emerald-400 cursor-pointer shadow-md"
              >
                {sqlCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{sqlCopied ? 'SQL Copied!' : 'Copy SQL'}</span>
              </button>
            </div>
            <pre className="bg-[#0e0806] p-3 rounded-2xl border border-[#3a251b] text-[10px] text-emerald-400 font-mono overflow-x-auto max-h-60 leading-relaxed">
              {FULL_PROJECT_SQL}
            </pre>
          </div>
        )}
      </div>

      {/* Anti-Fraud Rules & Referral Policy Section */}
      <div className="bg-gradient-to-br from-[#241310] to-[#180b08] p-4 rounded-3xl border border-rose-500/40 shadow-xl space-y-3">
        <div className="flex items-center gap-2 text-rose-400 font-black text-xs uppercase tracking-wider">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <span>Strict Security & Anti-Fraud Rules</span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-start gap-2 bg-[#170a08] p-2.5 rounded-2xl border border-rose-900/40">
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

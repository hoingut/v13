import React, { useState } from 'react';
import { User } from '../types';
import { User as UserIcon, ShieldCheck, Copy, Check, LogOut, Sparkles, Smartphone, Gift, Wallet, Award, ArrowRight, Send, MessageCircle, AlertTriangle, ShieldAlert, Lock, CheckCircle2 } from 'lucide-react';

interface AccountViewProps {
  user: User | null;
  onOpenAuth: () => void;
  onOpenWithdraw: () => void;
  onOpenAdmin: () => void;
  onLogout: () => void;
}

export const AccountView: React.FC<AccountViewProps> = ({
  user,
  onOpenAuth,
  onOpenWithdraw,
  onOpenAdmin,
  onLogout,
}) => {
  const [copied, setCopied] = useState(false);

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

  const estimatedTaka = Math.floor((user.balance / 1000) * 2);

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

      {/* Balance & Estimated Cash value */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#241713] p-4 rounded-3xl border border-[#432f26] shadow-lg flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-amber-300/70 uppercase">Total Coins</span>
            <div className="text-xl font-black text-amber-400 font-mono mt-1">
              {user.balance.toLocaleString()}
            </div>
          </div>
          <span className="text-[10px] text-amber-300/50 mt-2">XN Reward Currency</span>
        </div>

        <div className="bg-gradient-to-br from-emerald-950/80 to-[#19231f] p-4 rounded-3xl border border-emerald-500/30 shadow-lg flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-emerald-300 uppercase">Estimated Cash</span>
            <div className="text-xl font-black text-emerald-400 font-mono mt-1">
              ৳ {estimatedTaka} BDT
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


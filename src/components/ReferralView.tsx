import React, { useState, useEffect } from 'react';
import { User, ReferralRecord } from '../types';
import { fetchReferralsApi, getDeviceInfo } from '../lib/api';
import { Users, Copy, Check, ShieldAlert, ShieldCheck, Clock, Award, Info } from 'lucide-react';

interface ReferralViewProps {
  user: User | null;
  onOpenAuth: () => void;
}

export const ReferralView: React.FC<ReferralViewProps> = ({ user, onOpenAuth }) => {
  const [referrals, setReferrals] = useState<ReferralRecord[]>(() => {
    if (!user) return [];
    try {
      const cached = localStorage.getItem(`nxb_ref_cache_${user.id}`);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [referralCode, setReferralCode] = useState<string>(user?.referralCode || '');
  const [copied, setCopied] = useState(false);
  const [deviceDetails, setDeviceDetails] = useState<{ deviceId: string; deviceName: string }>({ deviceId: '', deviceName: '' });

  useEffect(() => {
    setDeviceDetails(getDeviceInfo());
    if (user) {
      loadReferrals();
    }
  }, [user]);

  const loadReferrals = async () => {
    if (!user) return;
    try {
      const res = await fetchReferralsApi(user.id);
      if (res.success) {
        setReferrals(res.referrals || []);
        setReferralCode(res.referralCode || user.referralCode);
        localStorage.setItem(`nxb_ref_cache_${user.id}`, JSON.stringify(res.referrals || []));
      }
    } catch (err) {
      console.warn('[Cache] Using cached referrals due to network error:', err);
    }
  };

  const referralLink = `${window.location.origin}?ref=${referralCode || user?.referralCode || ''}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const verifiedCount = referrals.filter(r => r.status === 'verified').length;
  const pendingCount = referrals.filter(r => r.status === 'pending').length;

  return (
    <div className="flex flex-col gap-4 px-4 pt-2 pb-24 text-amber-50">
      {/* Title Card */}
      <div className="bg-gradient-to-r from-[#33221b] to-[#241713] p-4 rounded-3xl border border-[#4d352b]/80 shadow-xl flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-amber-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            <span>INVITE FRIENDS</span>
          </h2>
          <p className="text-xs text-amber-300/80 mt-1 font-medium">
            প্রতি সফল রেফারে পাবেন ১০ টাকা (Taka)। নতুন সাইনআপ এ ১০০ Coin বোনাস।
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-lg">
          🤝
        </div>
      </div>

      {/* Device Anti-Fraud Protection Badge */}
      <div className="bg-[#1e130f] p-3 rounded-2xl border border-[#3e2a22] flex items-center gap-3 text-xs">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
        <div>
          <span className="font-bold text-amber-200">Anti-Self-Referral Tracking Active</span>
          <p className="text-[11px] text-amber-300/60 font-mono">
            Device ID: {deviceDetails.deviceId.substring(0, 16)}... ({deviceDetails.deviceName})
          </p>
        </div>
      </div>

      {/* Referral Link Container */}
      <div className="bg-[#2a1d18]/90 p-4 rounded-3xl border border-[#4a342b] flex flex-col gap-3 shadow-lg">
        <label className="text-xs font-bold text-amber-300 uppercase tracking-wider">Your Unique Referral Link</label>
        <div className="flex items-center gap-2 bg-[#1a110e] p-2 rounded-2xl border border-[#3d2922]">
          <input
            type="text"
            readOnly
            value={user ? referralLink : 'Please login to get referral link'}
            className="w-full bg-transparent text-xs text-amber-200 font-mono px-2 focus:outline-none"
          />
          <button
            onClick={user ? copyToClipboard : onOpenAuth}
            className="bg-gradient-to-r from-amber-500 to-orange-500 text-black font-extrabold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Rules Explanation Card */}
      <div className="bg-[#241713]/80 p-4 rounded-2xl border border-[#442f26] text-xs flex flex-col gap-2">
        <div className="flex items-center gap-1.5 text-amber-400 font-bold text-sm">
          <Info className="w-4 h-4" />
          <span>রেফার নিয়মাবলী</span>
        </div>

        <div className="bg-[#190f0c] p-3 rounded-xl border border-[#3d271f] text-amber-200 font-semibold text-xs flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-400 shrink-0" />
          <span>রেফার ভেরিফিকেশন সময় ১২ ঘণ্টা।</span>
        </div>
      </div>

      {/* Referral Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#281b16] p-3.5 rounded-2xl border border-[#483228] flex flex-col items-center">
          <span className="text-2xl font-black text-emerald-400 font-mono">{verifiedCount}</span>
          <span className="text-[11px] text-amber-300/70 font-semibold">Verified Referrals</span>
        </div>
        <div className="bg-[#281b16] p-3.5 rounded-2xl border border-[#483228] flex flex-col items-center">
          <span className="text-2xl font-black text-amber-400 font-mono">{pendingCount}</span>
          <span className="text-[11px] text-amber-300/70 font-semibold">পেন্ডিং</span>
        </div>
      </div>

      {/* Friends Referral List */}
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-bold text-amber-200 flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400" />
          <span>Invited Friends ({referrals.length})</span>
        </h3>

        {referrals.length === 0 ? (
          <div className="bg-[#201410] p-6 rounded-2xl border border-[#3b2820] text-center text-xs text-amber-300/50">
            No invited friends yet. Share your link to start earning 10 Taka per referral!
          </div>
        ) : (
          referrals.map(ref => (
            <div
              key={ref.id}
              className="bg-[#261914] p-3 rounded-2xl border border-[#452e24] flex items-center justify-between text-xs"
            >
              <div>
                <p className="font-bold text-amber-100">{ref.referredUserName}</p>
                <p className="text-[10px] text-amber-300/50 font-mono">{ref.referredUserEmail}</p>
              </div>

              <div>
                {ref.status === 'verified' ? (
                  <span className="bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-xl text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Verified (+10 Taka)
                  </span>
                ) : ref.status === 'pending' ? (
                  <span className="bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-xl text-[10px] font-bold border border-amber-500/30 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> পেন্ডিং
                  </span>
                ) : (
                  <span className="bg-rose-500/20 text-rose-300 px-2.5 py-1 rounded-xl text-[10px] font-bold border border-rose-500/30 flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3" /> Failed / Fraud
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

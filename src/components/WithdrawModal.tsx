import React, { useState, useEffect } from 'react';
import { User, WithdrawalRecord, ReferralRecord } from '../types';
import { requestWithdrawalApi, fetchWithdrawalsApi, fetchReferralsApi } from '../lib/api';
import { Wallet, X, AlertCircle, CheckCircle, Clock, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';

interface WithdrawModalProps {
  user: User;
  onClose: () => void;
  onUpdateUser: (updatedUser: User) => void;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({ user, onClose, onUpdateUser }) => {
  const [paymentMethod, setPaymentMethod] = useState<'bKash' | 'Nagad' | 'Rocket'>('bKash');
  const [accountNumber, setAccountNumber] = useState('');
  const [coinsAmount, setCoinsAmount] = useState<number>(100000);
  const [referralsCount, setReferralsCount] = useState<number>(0);
  const [myWithdrawals, setMyWithdrawals] = useState<WithdrawalRecord[]>([]);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Check if current date is before 15 August 2026
  const targetDate = new Date('2026-08-15T00:00:00');
  const currentDate = new Date();
  const isBeforeAug15 = currentDate < targetDate;

  // Minimum coins required based on date rules (250k before Aug 15, 100k after Aug 15)
  const minCoinsRequired = isBeforeAug15 ? 250000 : 100000;

  useEffect(() => {
    loadData();
    // Default coin amount to the min required
    setCoinsAmount(minCoinsRequired);
  }, [minCoinsRequired]);

  const loadData = async () => {
    // Fetch user referrals
    const refRes = await fetchReferralsApi(user.id);
    if (refRes.success && refRes.referrals) {
      // Count total referrals (both verified & pending)
      setReferralsCount(refRes.referrals.length);
    }

    // Fetch past withdrawals
    const wRes = await fetchWithdrawalsApi(user.id);
    if (wRes.success && wRes.withdrawals) {
      setMyWithdrawals(wRes.withdrawals);
    }
  };

  // Calculated Taka: 1k coins = 2 Taka
  const calculatedTaka = Math.floor((coinsAmount / 1000) * 2);

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Rule 1: Minimum 4 referrals condition
    if (referralsCount < 4) {
      setErrorMessage(`উইথড্র করতে সর্বনিম্ন ৪ জন রেফার লাগবে! (আপনার বর্তমান রেফার: ${referralsCount})`);
      return;
    }

    // Rule 2: Minimum Coin condition based on date
    if (coinsAmount < minCoinsRequired) {
      if (isBeforeAug15) {
        setErrorMessage(`১৫ আগস্ট এর আগে উইথড্র করতে সর্বনিম্ন ২৫০k (250,000) Coin লাগবে!`);
      } else {
        setErrorMessage(`১৫ আগস্ট এর পর উইথড্র করতে সর্বনিম্ন ১০০k (100,000) Coin লাগবে!`);
      }
      return;
    }

    // Rule 3: User balance check
    if (user.balance < coinsAmount) {
      setErrorMessage(`আপনার অ্যাকাউন্টে পর্যাপ্ত Coin নেই! (বর্তমান ব্যালেন্স: ${user.balance.toLocaleString()} Coin)`);
      return;
    }

    if (!accountNumber || accountNumber.trim().length < 11) {
      setErrorMessage(`সঠিক ${paymentMethod} অ্যাকাউন্ট নম্বর লিখুন (১১ ডিজিট)।`);
      return;
    }

    setLoading(true);
    const res = await requestWithdrawalApi({
      userId: user.id,
      paymentMethod,
      accountNumber: accountNumber.trim(),
      coinsAmount,
    });
    setLoading(false);

    if (res.success) {
      setSuccessMessage('উইথড্র রিকুয়েস্ট সফলভাবে প্যানেলে জমা হয়েছে!');
      if (res.user) {
        onUpdateUser(res.user);
      }
      setAccountNumber('');
      loadData();
    } else {
      setErrorMessage(res.error || 'উইথড্র রিকুয়েস্ট ব্যর্থ হয়েছে।');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 text-amber-50">
      <div className="bg-[#241713] border border-[#4d352b] rounded-3xl p-5 w-full max-w-md shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-amber-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-amber-100">উইথড্র প্যানেল (Withdraw)</h2>
            <p className="text-[11px] text-amber-300/70 font-mono">
              রেট: ১k Coin = ২ টাকা | রেট ফি করার সুযোগ
            </p>
          </div>
        </div>

        {/* Current Date Rule Banner */}
        <div className="bg-[#180e0b] p-3 rounded-2xl border border-[#3e2a22] text-xs mb-3 space-y-1.5">
          <div className="flex justify-between items-center font-bold text-amber-300">
            <span>উইথড্র শর্তাবলী:</span>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
              {isBeforeAug15 ? '১৫ আগস্ট এর আগে' : '১৫ আগস্ট এর পর'}
            </span>
          </div>

          <ul className="list-disc list-inside text-amber-200/90 text-[11px] space-y-1">
            <li>
              <strong>১৫ আগস্ট এর আগে:</strong> ২৫০k Coin = ৫০০ টাকা উইথড্র
            </li>
            <li>
              <strong>১৫ আগস্ট এর পর:</strong> ১০০k Coin = ২০০ টাকা উইথড্র
            </li>
            <li>
              <strong>১k Coin রেট:</strong> ২ টাকা
            </li>
            <li className="text-amber-400 font-bold">
              <strong>রেফার শর্ত:</strong> সর্বনিম্ন ৪ জন রেফার থাকতে হবে (আপনার রেফার: {referralsCount}/4)
            </li>
          </ul>
        </div>

        {/* Error / Success Alerts */}
        {errorMessage && (
          <div className="bg-rose-950/80 border border-rose-500/80 text-rose-200 text-xs p-3 rounded-2xl mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="bg-emerald-950/80 border border-emerald-500/80 text-emerald-200 text-xs p-3 rounded-2xl mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Withdraw Form */}
        <form onSubmit={handleWithdrawSubmit} className="flex flex-col gap-3 text-xs">
          <div>
            <label className="font-bold text-amber-300 block mb-1">Payment Method</label>
            <div className="grid grid-cols-3 gap-2">
              {(['bKash', 'Nagad', 'Rocket'] as const).map(m => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setPaymentMethod(m)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    paymentMethod === m
                      ? 'bg-amber-500 text-black border-amber-400 font-extrabold shadow-md'
                      : 'bg-[#180e0b] text-amber-200 border-[#3e2a22]'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-bold text-amber-300 block mb-1">
              {paymentMethod} Account Number
            </label>
            <input
              type="text"
              required
              value={accountNumber}
              onChange={e => setAccountNumber(e.target.value)}
              placeholder="017xxxxxxxx"
              className="w-full bg-[#180e0b] border border-[#3e2a22] rounded-xl px-3 py-2.5 text-amber-100 font-mono focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="font-bold text-amber-300 block mb-1 flex justify-between">
              <span>Coins to Withdraw</span>
              <span className="text-[10px] text-amber-400 font-mono">
                Available: {user.balance.toLocaleString()} Coins
              </span>
            </label>
            <input
              type="number"
              required
              min={minCoinsRequired}
              value={coinsAmount}
              onChange={e => setCoinsAmount(Number(e.target.value))}
              className="w-full bg-[#180e0b] border border-[#3e2a22] rounded-xl px-3 py-2.5 text-amber-100 font-mono focus:outline-none focus:border-amber-500 text-sm"
            />
          </div>

          {/* Calculated Taka Display */}
          <div className="bg-[#1a0f0c] p-3 rounded-2xl border border-[#3d271f] flex justify-between items-center text-xs">
            <span className="text-amber-200/80 font-bold">প্রাপ্য টাকা (Taka):</span>
            <span className="text-lg font-black text-emerald-400 font-mono">
              ৳ {calculatedTaka} BDT
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-black font-extrabold py-3 rounded-2xl shadow-lg mt-1 hover:from-amber-400 hover:to-orange-400 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>{loading ? 'প্রসেসিং হচ্ছে...' : 'উইথড্র রিকুয়েস্ট দিন (Submit Request)'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* History of Withdrawals */}
        <div className="mt-5 flex flex-col gap-2">
          <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
            আমার উইথড্র হিস্ট্রি ({myWithdrawals.length})
          </h3>

          {myWithdrawals.length === 0 ? (
            <p className="text-xs text-amber-300/40 text-center py-2">কোনো উইথড্র রিকুয়েস্ট নেই।</p>
          ) : (
            myWithdrawals.map(w => (
              <div key={w.id} className="bg-[#180e0b] p-3 rounded-2xl border border-[#3d271f] flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-amber-100">{w.paymentMethod}: {w.accountNumber}</p>
                  <p className="text-[10px] text-amber-300/60 font-mono">
                    {w.coinsAmount.toLocaleString()} Coins = ৳ {w.takaAmount} BDT
                  </p>
                </div>
                <div>
                  {w.status === 'approved' ? (
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Paid
                    </span>
                  ) : w.status === 'pending' ? (
                    <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Request Panel
                    </span>
                  ) : (
                    <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" /> Rejected
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

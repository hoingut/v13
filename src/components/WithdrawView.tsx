import React, { useState, useEffect } from 'react';
import { User, WithdrawalRecord } from '../types';
import { requestWithdrawalApi, fetchWithdrawalsApi, fetchReferralsApi } from '../lib/api';
import { Wallet, AlertCircle, CheckCircle, Clock, ArrowRight, ShieldAlert, Gift, Calendar, DollarSign, Coins, Landmark } from 'lucide-react';

interface WithdrawViewProps {
  user: User | null;
  onUpdateUser: (updatedUser: User) => void;
  onOpenAuth: () => void;
}

export const WithdrawView: React.FC<WithdrawViewProps> = ({ user, onUpdateUser, onOpenAuth }) => {
  const [withdrawType, setWithdrawType] = useState<'coins' | 'taka'>('coins');
  const [paymentMethod, setPaymentMethod] = useState<'bKash' | 'Nagad' | 'Rocket' | 'Binance'>('bKash');
  const [accountNumber, setAccountNumber] = useState('');
  const [coinsAmountInput, setCoinsAmountInput] = useState<string>('250000');
  const [takaAmountInput, setTakaAmountInput] = useState<string>('300');
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
    if (user) {
      loadData();
      setCoinsAmountInput(String(minCoinsRequired));
    }
  }, [user, minCoinsRequired]);

  const loadData = async () => {
    if (!user) return;
    // Fetch user referrals count
    const refRes = await fetchReferralsApi(user.id);
    if (refRes.success && refRes.referrals) {
      setReferralsCount(refRes.referrals.length);
    }

    // Fetch past withdrawals
    const wRes = await fetchWithdrawalsApi(user.id);
    if (wRes.success && wRes.withdrawals) {
      setMyWithdrawals(wRes.withdrawals);
    }
  };

  const parsedCoinsAmount = Number(coinsAmountInput) || 0;
  const parsedTakaAmount = Number(takaAmountInput) || 0;

  // Calculated Taka for Coin Withdrawal: 1k coins = 2 Taka
  const calculatedTakaFromCoins = Math.floor((parsedCoinsAmount / 1000) * 2);

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!user) {
      onOpenAuth();
      return;
    }

    // Rule 1: Minimum 4 referrals condition
    if (referralsCount < 4) {
      setErrorMessage(`উইথড্র করতে সর্বনিম্ন ৪ জন রেফার লাগবে! (আপনার বর্তমান রেফার: ${referralsCount})`);
      return;
    }

    if (!accountNumber || accountNumber.trim().length < 5) {
      setErrorMessage(`সঠিক ${paymentMethod} অ্যাকাউন্ট নম্বর বা ওয়ালেট অ্যাড্রেস লিখুন।`);
      return;
    }

    if (withdrawType === 'coins') {
      // Coins Rule: Minimum Coin condition based on date
      if (parsedCoinsAmount < minCoinsRequired) {
        if (isBeforeAug15) {
          setErrorMessage(`১৫ আগস্ট এর আগে উইথড্র করতে সর্বনিম্ন ২৫০k (250,000) Coin লাগবে!`);
        } else {
          setErrorMessage(`১৫ আগস্ট এর পর উইথড্র করতে সর্বনিম্ন ১০০k (100,000) Coin লাগবে!`);
        }
        return;
      }

      if (user.balance < parsedCoinsAmount) {
        setErrorMessage(`আপনার অ্যাকাউন্টে পর্যাপ্ত Coin নেই! (বর্তমান ব্যালেন্স: ${user.balance.toLocaleString()} Coin)`);
        return;
      }
    } else {
      // Taka Rule: Minimum 300 Taka
      if (parsedTakaAmount < 300) {
        setErrorMessage(`টাকা উইথড্র করতে সর্বনিম্ন ৳৩০০ Taka লাগবে!`);
        return;
      }

      const userTaka = user.takaBalance || 0;
      if (userTaka < parsedTakaAmount) {
        setErrorMessage(`আপনার অ্যাকাউন্টে পর্যাপ্ত Taka নেই! (বর্তমান Taka ব্যালেন্স: ৳${userTaka.toLocaleString()} BDT)`);
        return;
      }
    }

    setLoading(true);
    const res = await requestWithdrawalApi({
      userId: user.id,
      withdrawType,
      paymentMethod,
      accountNumber: accountNumber.trim(),
      coinsAmount: withdrawType === 'coins' ? parsedCoinsAmount : 0,
      takaAmount: withdrawType === 'taka' ? parsedTakaAmount : calculatedTakaFromCoins,
    });
    setLoading(false);

    if (res.success) {
      setSuccessMessage('উইথড্র রিকুয়েস্ট সফলভাবে জমা হয়েছে!');
      if (res.user) {
        onUpdateUser(res.user);
      }
      setAccountNumber('');
      loadData();
    } else {
      setErrorMessage(res.error || 'উইথড্র রিকুয়েস্ট ব্যর্থ হয়েছে।');
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-xl">
          <Wallet className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-amber-100">উইথড্র প্যানেল (Withdrawal)</h2>
        <p className="text-xs text-amber-300/70 max-w-xs">
          টাকা উইথড্র করতে এবং আপনার উইথড্র হিস্ট্রি দেখতে জিমেইল দিয়ে লগইন করুন।
        </p>
        <button
          onClick={onOpenAuth}
          className="bg-gradient-to-r from-amber-500 to-orange-500 text-black px-6 py-3 rounded-2xl font-black text-xs shadow-lg hover:from-amber-400 hover:to-orange-400 transition-all cursor-pointer"
        >
          Login with Gmail
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 pb-24 text-amber-50">
      {/* Page Title */}
      <div className="flex items-center gap-3 bg-gradient-to-r from-[#2a1b15] to-[#1c110d] p-4 rounded-3xl border border-[#4d362c] shadow-xl">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg border border-amber-300/30 shrink-0">
          <Wallet className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-lg font-black text-amber-100">উইথড্র প্যানেল (Withdrawal Page)</h1>
          <p className="text-xs text-emerald-400 font-mono font-bold">
            bKash | Nagad | Rocket | Binance
          </p>
        </div>
      </div>

      {/* Dual Balance Cards Header */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-gradient-to-br from-[#271a14] to-[#170e0b] p-3.5 rounded-3xl border border-amber-500/30 shadow-lg relative overflow-hidden">
          <div className="text-[10px] text-amber-400 font-extrabold uppercase tracking-wider flex items-center gap-1 mb-1">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>Coins Balance</span>
          </div>
          <div className="text-lg font-black text-amber-100 font-mono">
            {user.balance.toLocaleString()}
          </div>
          <p className="text-[9px] text-amber-300/60 mt-0.5">Earned from Tap & Game</p>
        </div>

        <div className="bg-gradient-to-br from-[#1a261a] to-[#0e170e] p-3.5 rounded-3xl border border-emerald-500/30 shadow-lg relative overflow-hidden">
          <div className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-wider flex items-center gap-1 mb-1">
            <Landmark className="w-3.5 h-3.5 text-emerald-400" />
            <span>Taka Balance</span>
          </div>
          <div className="text-lg font-black text-emerald-300 font-mono">
            ৳ {(user.takaBalance || 0).toLocaleString()} BDT
          </div>
          <p className="text-[9px] text-emerald-400/70 mt-0.5">Earned from Tasks & Referrals</p>
        </div>
      </div>

      {/* Prominent Official Withdrawal Minimum Rules Card */}
      <div className="bg-gradient-to-br from-[#271711] via-[#1d110d] to-[#140b08] p-4 rounded-3xl border border-amber-500/40 shadow-xl space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#3e271e]">
          <span className="font-extrabold text-sm text-amber-200 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>অফিশিয়াল উইথড্র নিয়মাবলি</span>
          </span>
          <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-full font-bold border border-amber-500/30">
            {isBeforeAug15 ? '১৫ আগস্ট এর আগে' : '১৫ আগস্ট এর পর'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-[#170e0b] p-3 rounded-2xl border border-amber-500/30 space-y-1">
            <div className="text-[10px] text-amber-400 font-bold uppercase">Coin উইথড্র (১৫ Aug আগে):</div>
            <div className="text-sm font-black text-amber-100 font-mono">২৫০k Coin</div>
            <div className="text-[11px] text-emerald-400 font-bold font-mono">= ৫০০ টাকা</div>
          </div>

          <div className="bg-[#170e0b] p-3 rounded-2xl border border-emerald-500/30 space-y-1">
            <div className="text-[10px] text-emerald-400 font-bold uppercase">Taka উইথড্র নিয়ম:</div>
            <div className="text-sm font-black text-emerald-300 font-mono">সর্বনিম্ন ৳৩০০</div>
            <div className="text-[11px] text-amber-300 font-bold font-mono">Task & Refer reward</div>
          </div>
        </div>

        <div className="bg-[#170e0b] p-3 rounded-2xl border border-[#3e281e] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-amber-200">Coin কনভার্সন রেট:</span>
          </div>
          <span className="font-black text-emerald-400 font-mono text-sm">১k Coin = ২ টাকা</span>
        </div>

        <div className="bg-[#170e0b] p-3 rounded-2xl border border-[#3e281e] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-orange-400" />
            <span className="font-bold text-amber-200">সর্বনিম্ন রেফার শর্ত:</span>
          </div>
          <span className={`font-black font-mono text-xs px-2.5 py-0.5 rounded-full ${
            referralsCount >= 4 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
          }`}>
            {referralsCount} / 4 রেফার সম্পন্ন
          </span>
        </div>
      </div>

      {/* Error / Success Alerts */}
      {errorMessage && (
        <div className="bg-rose-950/90 border border-rose-500/80 text-rose-200 text-xs p-3.5 rounded-2xl flex items-center gap-2 shadow-lg animate-shake">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="bg-emerald-950/90 border border-emerald-500/80 text-emerald-200 text-xs p-3.5 rounded-2xl flex items-center gap-2 shadow-lg">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Withdrawal Form */}
      <form onSubmit={handleWithdrawSubmit} className="bg-[#211410] p-4 rounded-3xl border border-[#442f26] shadow-xl space-y-3 text-xs">
        {/* Withdraw Type Switcher */}
        <div>
          <label className="font-bold text-amber-300 block mb-1">উইথড্র ক্যাটাগরি সিলেক্ট করুন</label>
          <div className="grid grid-cols-2 gap-2 bg-[#140b08] p-1 rounded-2xl border border-[#38251e]">
            <button
              type="button"
              onClick={() => setWithdrawType('coins')}
              className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                withdrawType === 'coins'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-amber-200/60 hover:text-amber-100'
              }`}
            >
              <Coins className="w-4 h-4" />
              <span>Coin Withdrawal</span>
            </button>
            <button
              type="button"
              onClick={() => setWithdrawType('taka')}
              className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                withdrawType === 'taka'
                  ? 'bg-emerald-500 text-black shadow-md'
                  : 'text-emerald-200/60 hover:text-emerald-100'
              }`}
            >
              <Landmark className="w-4 h-4" />
              <span>Taka Withdrawal</span>
            </button>
          </div>
        </div>

        {/* Payment Methods */}
        <div>
          <label className="font-bold text-amber-300 block mb-1">পেমেন্ট মেথড (Payment Method)</label>
          <div className="grid grid-cols-4 gap-1.5">
            {(['bKash', 'Nagad', 'Rocket', 'Binance'] as const).map(m => (
              <button
                type="button"
                key={m}
                onClick={() => setPaymentMethod(m)}
                className={`py-2.5 rounded-2xl text-[11px] font-black border transition-all cursor-pointer ${
                  paymentMethod === m
                    ? m === 'Binance'
                      ? 'bg-amber-400 text-black border-amber-200 shadow-md scale-102 font-mono'
                      : 'bg-amber-500 text-black border-amber-300 shadow-md scale-102'
                    : 'bg-[#140b08] text-amber-200/80 border-[#38251e] hover:border-amber-500/40'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Account / Address Input (Empty default, no autofill) */}
        <div>
          <label className="font-bold text-amber-300 block mb-1">
            {paymentMethod === 'Binance' ? 'Binance Pay ID / USDT Wallet Address' : `${paymentMethod} অ্যাকাউন্ট নম্বর (Account Number)`}
          </label>
          <input
            type="text"
            required
            value={accountNumber}
            onChange={e => setAccountNumber(e.target.value)}
            placeholder={paymentMethod === 'Binance' ? 'e.g. 123456789 or T...' : '017xxxxxxxx'}
            className="w-full bg-[#140b08] border border-[#3e2a22] rounded-2xl px-3.5 py-3 text-amber-100 font-mono focus:outline-none focus:border-amber-500 text-sm"
          />
        </div>

        {/* Amount Input based on type */}
        {withdrawType === 'coins' ? (
          <div>
            <label className="font-bold text-amber-300 block mb-1 flex justify-between">
              <span>উইথড্র Coin সংখ্যা</span>
              <span className="text-[10px] text-amber-400 font-mono font-bold">
                ব্যালেন্স: {user.balance.toLocaleString()} Coins
              </span>
            </label>
            <input
              type="number"
              required
              min={minCoinsRequired}
              value={coinsAmountInput}
              onChange={e => setCoinsAmountInput(e.target.value)}
              className="w-full bg-[#140b08] border border-[#3e2a22] rounded-2xl px-3.5 py-3 text-amber-100 font-mono focus:outline-none focus:border-amber-500 text-base font-bold"
            />

            {/* Calculated Taka Display */}
            <div className="bg-[#140b08] p-3 rounded-2xl border border-emerald-500/30 flex justify-between items-center text-xs mt-2">
              <span className="text-amber-200 font-bold">প্রাপ্য টাকা (1k Coin = ৳2 Taka):</span>
              <span className="text-base font-black text-emerald-400 font-mono">
                ৳ {calculatedTakaFromCoins} BDT
              </span>
            </div>
          </div>
        ) : (
          <div>
            <label className="font-bold text-emerald-300 block mb-1 flex justify-between">
              <span>উইথড্র Taka পরিমাণ (BDT)</span>
              <span className="text-[10px] text-emerald-400 font-mono font-bold">
                ব্যালেন্স: ৳{(user.takaBalance || 0).toLocaleString()} BDT
              </span>
            </label>
            <input
              type="number"
              required
              min={300}
              value={takaAmountInput}
              onChange={e => setTakaAmountInput(e.target.value)}
              className="w-full bg-[#140b08] border border-emerald-500/30 rounded-2xl px-3.5 py-3 text-emerald-300 font-mono focus:outline-none focus:border-emerald-500 text-base font-bold"
            />
            <p className="text-[10px] text-emerald-400/70 mt-1 font-mono">
              * সর্বনিম্ন ৳৩০০ টাকা এবং ৪ টি রেফার থাকতে হবে।
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-black font-extrabold py-3.5 rounded-2xl shadow-xl hover:from-amber-400 hover:to-orange-400 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm disabled:opacity-50"
        >
          <span>{loading ? 'প্রসেসিং হচ্ছে...' : 'উইথড্র রিকুয়েস্ট সাবমিট করুন'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* History of Withdrawals */}
      <div className="bg-[#211410] p-4 rounded-3xl border border-[#442f26] shadow-xl space-y-3">
        <h3 className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-400" />
          <span>আমার সমস্ত উইথড্র হিস্ট্রি ({myWithdrawals.length})</span>
        </h3>

        {myWithdrawals.length === 0 ? (
          <p className="text-xs text-amber-300/50 text-center py-4 bg-[#140b08] rounded-2xl border border-[#38251e]">
            এখনো কোনো উইথড্র রিকুয়েস্ট করা হয়নি।
          </p>
        ) : (
          <div className="space-y-2">
            {myWithdrawals.map(w => (
              <div key={w.id} className="bg-[#140b08] p-3.5 rounded-2xl border border-[#38251e] flex items-center justify-between text-xs">
                <div>
                  <p className="font-extrabold text-amber-100">{w.paymentMethod}: {w.accountNumber}</p>
                  <p className="text-[11px] text-amber-300/70 font-mono mt-0.5">
                    {w.withdrawType === 'taka' ? (
                      <strong className="text-emerald-400 font-black">৳ {w.takaAmount} BDT (Taka Balance)</strong>
                    ) : (
                      <>{w.coinsAmount.toLocaleString()} Coins = <strong className="text-emerald-400 font-black">৳ {w.takaAmount} BDT</strong></>
                    )}
                  </p>
                </div>
                <div>
                  {w.status === 'approved' ? (
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Paid
                    </span>
                  ) : w.status === 'pending' ? (
                    <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-400" /> Request Panel
                    </span>
                  ) : (
                    <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> Rejected
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

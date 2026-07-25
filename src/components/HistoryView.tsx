import React, { useState, useEffect } from 'react';
import { User, TaskSubmission, WithdrawalRecord } from '../types';
import { fetchMySubmissionsApi, fetchWithdrawalsApi } from '../lib/api';
import { History, CheckCircle2, Clock, XCircle, Wallet, FileText, ArrowDownRight } from 'lucide-react';

interface HistoryViewProps {
  user: User | null;
  onOpenAuth: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ user, onOpenAuth }) => {
  const [activeTab, setActiveTab] = useState<'submissions' | 'withdrawals'>('submissions');
  const [submissions, setSubmissions] = useState<TaskSubmission[]>(() => {
    if (!user) return [];
    try {
      const cached = localStorage.getItem(`nxb_subs_cache_${user.id}`);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [withdrawals, setWithdrawals] = useState<WithdrawalRecord[]>(() => {
    if (!user) return [];
    try {
      const cached = localStorage.getItem(`nxb_with_cache_${user.id}`);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadHistory();
    }
  }, [user]);

  const loadHistory = async () => {
    if (!user) return;
    // Don't show blocking loading spinner if we already have cached items to display immediately
    if (submissions.length === 0 && withdrawals.length === 0) {
      setLoading(true);
    }

    try {
      const [subRes, withRes] = await Promise.all([
        fetchMySubmissionsApi(user.id),
        fetchWithdrawalsApi(user.id)
      ]);

      if (subRes.submissions) {
        setSubmissions(subRes.submissions);
        localStorage.setItem(`nxb_subs_cache_${user.id}`, JSON.stringify(subRes.submissions));
      }
      if (withRes.withdrawals) {
        setWithdrawals(withRes.withdrawals);
        localStorage.setItem(`nxb_with_cache_${user.id}`, JSON.stringify(withRes.withdrawals));
      }
    } catch (err) {
      console.error('Error loading history:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="p-6 text-center text-amber-50 my-10 bg-[#241713] rounded-3xl border border-[#4a352b] max-w-sm mx-auto shadow-xl">
        <History className="w-12 h-12 text-amber-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold">Log in to View History</h3>
        <p className="text-xs text-amber-300/70 mt-1 mb-4">
          Please log in to track your task proof submissions & withdrawal status.
        </p>
        <button
          onClick={onOpenAuth}
          className="bg-amber-500 text-black px-6 py-2.5 rounded-2xl font-black text-xs shadow-lg hover:bg-amber-400"
        >
          Login with Gmail
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-4 pt-2 pb-24 text-amber-50">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-[#2c1d18] to-[#1c110d] p-4 rounded-3xl border border-[#4d362c] shadow-xl flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-amber-100 flex items-center gap-2">
            <History className="w-5 h-5 text-amber-400" />
            <span>YOUR ACTIVITY HISTORY</span>
          </h2>
          <p className="text-xs text-amber-300/70 mt-1">
            Real-time status of your task approvals and cashout requests.
          </p>
        </div>
      </div>

      {/* Switcher Tabs */}
      <div className="flex bg-[#251814] p-1.5 rounded-2xl border border-[#443027]">
        <button
          onClick={() => setActiveTab('submissions')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'submissions' ? 'bg-amber-500 text-black shadow-md' : 'text-amber-200/60'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Tasks ({submissions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('withdrawals')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'withdrawals' ? 'bg-amber-500 text-black shadow-md' : 'text-amber-200/60'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Withdrawals ({withdrawals.length})</span>
        </button>
      </div>

      {/* Content List */}
      {loading ? (
        <div className="py-12 text-center text-amber-300/60 text-xs">
          Loading history...
        </div>
      ) : activeTab === 'submissions' ? (
        submissions.length === 0 ? (
          <div className="bg-[#1f130f] p-8 rounded-3xl border border-[#3b2820] text-center text-xs text-amber-300/60">
            No task submissions found yet. Complete tasks to earn rewards!
          </div>
        ) : (
          <div className="space-y-2.5">
            {submissions.map(sub => (
              <div
                key={sub.id}
                className="bg-[#1e130f] p-3.5 rounded-2xl border border-[#3d2921] flex items-center justify-between shadow-md"
              >
                <div>
                  <div className="text-xs font-bold text-amber-100 flex items-center gap-2">
                    <span>Task ID: {sub.taskId}</span>
                  </div>
                  <div className="text-[10px] text-amber-300/60 mt-0.5 font-mono">
                    {new Date(sub.submittedAt).toLocaleString()}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {sub.status === 'approved' && (
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] px-2.5 py-1 rounded-xl font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Approved</span>
                    </span>
                  )}
                  {sub.status === 'pending' && (
                    <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] px-2.5 py-1 rounded-xl font-bold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>In Review</span>
                    </span>
                  )}
                  {sub.status === 'rejected' && (
                    <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] px-2.5 py-1 rounded-xl font-bold flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5 text-rose-400" />
                      <span>Rejected</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        withdrawals.length === 0 ? (
          <div className="bg-[#1f130f] p-8 rounded-3xl border border-[#3b2820] text-center text-xs text-amber-300/60">
            No withdrawal records found yet. Withdraw your coins anytime!
          </div>
        ) : (
          <div className="space-y-2.5">
            {withdrawals.map(item => (
              <div
                key={item.id}
                className="bg-[#1e130f] p-3.5 rounded-2xl border border-[#3d2921] flex items-center justify-between shadow-md"
              >
                <div>
                  <div className="text-xs font-bold text-amber-100 flex items-center gap-2">
                    <span className="text-emerald-400 font-mono">৳ {item.takaAmount} BDT</span>
                    <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded text-amber-300 font-mono">
                      {item.paymentMethod}
                    </span>
                  </div>
                  <div className="text-[11px] text-amber-300/70 font-mono mt-1">
                    Acc: {item.accountNumber} ({item.coinsAmount.toLocaleString()} Coins)
                  </div>
                  <div className="text-[10px] text-amber-400/50 font-mono mt-0.5">
                    {new Date(item.requestedAt).toLocaleString()}
                  </div>
                </div>

                <div>
                  {item.status === 'approved' && (
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] px-2.5 py-1 rounded-xl font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Paid</span>
                    </span>
                  )}
                  {item.status === 'pending' && (
                    <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] px-2.5 py-1 rounded-xl font-bold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Processing</span>
                    </span>
                  )}
                  {item.status === 'rejected' && (
                    <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] px-2.5 py-1 rounded-xl font-bold flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5 text-rose-400" />
                      <span>Refunded</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { SystemSettings, TaskSubmission, WithdrawalRecord, User } from '../types';
import {
  fetchAdminSettingsApi,
  updateAdminSettingsApi,
  fetchAdminSubmissionsApi,
  reviewSubmissionApi,
  createAdminTaskApi,
  fetchWithdrawalsApi,
  reviewWithdrawalApi,
  fetchAdminUsersApi,
  adjustUserBalanceApi,
  adjustUserReferralsApi,
  toggleUserBanApi,
  deleteUserApi,
} from '../lib/api';
import { ShieldCheck, Key, Mail, CheckCircle, XCircle, Plus, Sparkles, Image as ImageIcon, Wallet, Lock, RefreshCw, Users, Search, Ban, Trash2, Coins, UserPlus } from 'lucide-react';

export const AdminView: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRecord[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'withdrawals' | 'submissions' | 'users' | 'add_task' | 'settings'>('withdrawals');

  // Form states
  const [imgbbKey, setImgbbKey] = useState('');
  const [brevoKey, setBrevoKey] = useState('');
  const [resendKey, setResendKey] = useState('');

  // User adjustment state
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [balanceAmount, setBalanceAmount] = useState<number>(1000);
  const [refCountAmount, setRefCountAmount] = useState<number>(1);

  // New task state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskReward, setTaskReward] = useState<number>(500);
  const [taskType, setTaskType] = useState<'one_time' | 'daily'>('one_time');
  const [taskCategory, setTaskCategory] = useState<string>('social');
  const [taskUrl, setTaskUrl] = useState('');
  const [taskRequiresProof, setTaskRequiresProof] = useState(true);

  const [message, setMessage] = useState<string | null>(null);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoadingData(true);
    await Promise.all([loadSettings(), loadSubmissions(), loadWithdrawals(), loadUsers()]);
    setLoadingData(false);
  };

  const loadUsers = async () => {
    const res = await fetchAdminUsersApi();
    if (res.success && res.users) {
      setUsers(res.users);
    }
  };

  const handleAdjustBalance = async (userId: string, amount: number) => {
    const action = amount >= 0 ? 'add' : 'subtract';
    const res = await adjustUserBalanceApi(userId, Math.abs(amount), action);
    if (res.success) {
      setMessage(`User balance updated successfully!`);
      loadUsers();
    } else {
      setMessage(`Failed to update balance: ${res.error}`);
    }
  };

  const handleAdjustReferrals = async (userId: string, count: number) => {
    const res = await adjustUserReferralsApi(userId, count);
    if (res.success) {
      setMessage(`User referral count updated successfully!`);
      loadUsers();
    } else {
      setMessage(`Failed to update referrals: ${res.error}`);
    }
  };

  const handleToggleBan = async (userId: string, currentBanned: boolean) => {
    const res = await toggleUserBanApi(userId, !currentBanned);
    if (res.success) {
      setMessage(`User ban status updated successfully!`);
      loadUsers();
    } else {
      setMessage(`Failed to toggle ban: ${res.error}`);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to permanently delete user "${userName}"?`)) return;
    const res = await deleteUserApi(userId);
    if (res.success) {
      setMessage(`User deleted successfully!`);
      loadUsers();
    } else {
      setMessage(`Failed to delete user: ${res.error}`);
    }
  };

  const loadSettings = async () => {
    const res = await fetchAdminSettingsApi();
    if (res.success && res.settings) {
      setSettings(res.settings);
      setImgbbKey(res.settings.imgbbApiKey || '');
      setBrevoKey(res.settings.brevoApiKey || '');
      setResendKey(res.settings.resendApiKey || '');
    }
  };

  const loadSubmissions = async () => {
    const res = await fetchAdminSubmissionsApi();
    if (res.success && res.submissions) {
      setSubmissions(res.submissions);
    }
  };

  const loadWithdrawals = async () => {
    const res = await fetchWithdrawalsApi();
    if (res.success && res.withdrawals) {
      setWithdrawals(res.withdrawals);
    }
  };

  const handleReviewSubmission = async (id: string, status: 'approved' | 'rejected') => {
    const res = await reviewSubmissionApi(id, status);
    if (res.success) {
      setMessage(`Submission ${status} successfully!`);
      loadSubmissions();
    } else {
      setMessage(`Failed to review submission: ${res.error}`);
    }
  };

  const handleReviewWithdrawal = async (id: string, status: 'approved' | 'rejected') => {
    const res = await reviewWithdrawalApi(id, status);
    if (res.success) {
      setMessage(`Withdrawal request ${status} successfully!`);
      loadWithdrawals();
    } else {
      setMessage(`Failed to process withdrawal: ${res.error}`);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await updateAdminSettingsApi({
      imgbbApiKey: imgbbKey.trim(),
      brevoApiKey: brevoKey.trim(),
      resendApiKey: resendKey.trim(),
    });

    if (res.success && res.settings) {
      setSettings(res.settings);
      setMessage('System Settings & API Keys Saved Successfully!');
    } else {
      setMessage('Failed to save settings.');
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle || taskReward <= 0) {
      setMessage('Please enter a valid task title and positive reward');
      return;
    }

    const res = await createAdminTaskApi({
      title: taskTitle.trim(),
      description: taskDesc.trim(),
      reward: taskReward,
      type: taskType,
      category: taskCategory,
      actionUrl: taskUrl.trim(),
      requiresProof: taskRequiresProof,
    });

    if (res.success) {
      setMessage('New Task Created Successfully!');
      setTaskTitle('');
      setTaskDesc('');
      setTaskReward(500);
      setTaskUrl('');
    } else {
      setMessage(`Failed to create task: ${res.error}`);
    }
  };

  const pendingWithdrawalsCount = withdrawals.filter(w => w.status === 'pending').length;
  const pendingSubmissionsCount = submissions.filter(s => s.status === 'pending').length;

  return (
    <div className="p-4 space-y-4 pb-24 text-amber-50">
      {/* Top Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-[#2e1c15] to-[#1e110d] p-4 rounded-3xl border border-amber-500/40 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center font-black text-black text-lg shadow-lg border border-amber-300/40">
            <ShieldCheck className="w-6 h-6 text-black" />
          </div>
          <div>
            <h1 className="text-lg font-black text-amber-100 flex items-center gap-2">
              <span>Admin Management Dashboard</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </h1>
            <p className="text-xs text-amber-300/70 font-mono">
              Withdrawal Requests • Submissions • Tasks • System APIs
            </p>
          </div>
        </div>

        <button
          onClick={loadAllData}
          disabled={loadingData}
          className="bg-[#2a1a14] text-amber-300 hover:text-white p-2.5 rounded-2xl border border-[#4d362c] flex items-center gap-1 text-xs font-bold shadow-md cursor-pointer active:scale-95"
          title="Refresh Data"
        >
          <RefreshCw className={`w-4 h-4 ${loadingData ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Tab Selector */}
      <div className="flex items-center gap-1.5 bg-[#170c09] p-2 rounded-2xl border border-[#3e281e] overflow-x-auto shadow-inner">
        <button
          onClick={() => setActiveTab('withdrawals')}
          className={`py-2 px-3 text-xs font-black rounded-xl shrink-0 transition-all cursor-pointer ${
            activeTab === 'withdrawals'
              ? 'bg-amber-500 text-black shadow-md'
              : 'text-amber-200/70 hover:text-amber-100'
          }`}
        >
          <span>Requests ({pendingWithdrawalsCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('submissions')}
          className={`py-2 px-3 text-xs font-black rounded-xl shrink-0 transition-all cursor-pointer ${
            activeTab === 'submissions'
              ? 'bg-amber-500 text-black shadow-md'
              : 'text-amber-200/70 hover:text-amber-100'
          }`}
        >
          <span>Submissions ({pendingSubmissionsCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`py-2 px-3 text-xs font-black rounded-xl shrink-0 transition-all cursor-pointer ${
            activeTab === 'users'
              ? 'bg-amber-500 text-black shadow-md'
              : 'text-amber-200/70 hover:text-amber-100'
          }`}
        >
          <span>Users ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('add_task')}
          className={`py-2 px-3 text-xs font-black rounded-xl shrink-0 transition-all cursor-pointer ${
            activeTab === 'add_task'
              ? 'bg-amber-500 text-black shadow-md'
              : 'text-amber-200/70 hover:text-amber-100'
          }`}
        >
          <span>+ Add Task</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`py-2 px-3 text-xs font-black rounded-xl shrink-0 transition-all cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-amber-500 text-black shadow-md'
              : 'text-amber-200/70 hover:text-amber-100'
          }`}
        >
          <span>API & SMTP</span>
        </button>
      </div>

      {message && (
        <div className="bg-amber-500/20 border border-amber-500/50 text-amber-200 text-xs p-3 rounded-2xl flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage(null)} className="text-amber-400 font-bold ml-2">✕</button>
        </div>
      )}

      {/* 1. Withdrawal Requests Tab */}
      {activeTab === 'withdrawals' && (
        <div className="bg-[#211410] p-4 rounded-3xl border border-[#442f26] shadow-xl space-y-3">
          <h2 className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-2">
            <Wallet className="w-4 h-4 text-emerald-400" />
            <span>Pending Cash Withdrawal Requests ({withdrawals.length})</span>
          </h2>

          {withdrawals.length === 0 ? (
            <p className="text-xs text-amber-300/50 text-center py-6 bg-[#140b08] rounded-2xl border border-[#38251e]">
              No withdrawal requests pending currently.
            </p>
          ) : (
            <div className="space-y-3">
              {withdrawals.map(req => (
                <div key={req.id} className="bg-[#140b08] p-3.5 rounded-2xl border border-[#38251e] space-y-2 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-extrabold text-amber-100 text-sm">{req.userName}</div>
                      <div className="text-[11px] text-amber-300/60 font-mono">{req.userEmail}</div>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                      req.status === 'approved'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : req.status === 'rejected'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}>
                      {req.status}
                    </span>
                  </div>

                  <div className="bg-[#1c100c] p-2.5 rounded-xl border border-[#3d2921] flex justify-between items-center font-mono">
                    <div>
                      <span className="text-amber-400 font-bold">{req.paymentMethod}:</span>{' '}
                      <span className="text-white font-black text-sm">{req.accountNumber}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-emerald-400 font-black text-sm">৳ {req.takaAmount} BDT</div>
                      <div className="text-[10px] text-amber-300/60">{req.coinsAmount.toLocaleString()} Coins</div>
                    </div>
                  </div>

                  {req.status === 'pending' && (
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => handleReviewWithdrawal(req.id, 'rejected')}
                        className="bg-rose-500/20 text-rose-300 border border-rose-500/40 px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 hover:bg-rose-500/30 cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                      <button
                        onClick={() => handleReviewWithdrawal(req.id, 'approved')}
                        className="bg-emerald-500 text-black px-4 py-1.5 rounded-xl font-black text-xs flex items-center gap-1 hover:bg-emerald-400 shadow-md cursor-pointer"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Approve & Pay
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. Task Submissions Tab */}
      {activeTab === 'submissions' && (
        <div className="bg-[#211410] p-4 rounded-3xl border border-[#442f26] shadow-xl space-y-3">
          <h2 className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-amber-400" />
            <span>Task Proof Submissions ({submissions.length})</span>
          </h2>

          {submissions.length === 0 ? (
            <p className="text-xs text-amber-300/50 text-center py-6 bg-[#140b08] rounded-2xl border border-[#38251e]">
              No task submissions available to review.
            </p>
          ) : (
            <div className="space-y-3">
              {submissions.map(sub => (
                <div key={sub.id} className="bg-[#140b08] p-3.5 rounded-2xl border border-[#38251e] space-y-2 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-extrabold text-amber-100">{sub.userName || 'User'}</div>
                      <div className="text-[11px] text-amber-300/60 font-mono">{sub.userEmail}</div>
                    </div>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono uppercase">
                      {sub.status}
                    </span>
                  </div>

                  {sub.proofImageUrl && (
                    <div className="mt-2">
                      <a href={sub.proofImageUrl} target="_blank" rel="noreferrer" className="block text-amber-400 text-xs underline mb-1 font-mono">
                        View Full Screenshot Proof ↗
                      </a>
                      <img src={sub.proofImageUrl} alt="Proof" className="max-h-40 rounded-xl border border-[#3d2921] object-cover" />
                    </div>
                  )}

                  {sub.status === 'pending' && (
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        onClick={() => handleReviewSubmission(sub.id, 'rejected')}
                        className="bg-rose-500/20 text-rose-300 border border-rose-500/40 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 hover:bg-rose-500/30 cursor-pointer"
                      >
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                      <button
                        onClick={() => handleReviewSubmission(sub.id, 'approved')}
                        className="bg-emerald-500 text-black px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 hover:bg-emerald-400 cursor-pointer"
                      >
                        <CheckCircle className="w-4 h-4" /> Approve & Credit
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. Add New Task Tab */}
      {activeTab === 'add_task' && (
        <form onSubmit={handleCreateTask} className="bg-[#211410] p-4 rounded-3xl border border-[#442f26] shadow-xl space-y-3 text-xs">
          <h2 className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-2">
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Publish New Task to App</span>
          </h2>

          <div>
            <label className="font-bold text-amber-300 block mb-1">Task Title</label>
            <input
              type="text"
              required
              value={taskTitle}
              onChange={e => setTaskTitle(e.target.value)}
              placeholder="Join Telegram Channel / Subscribe YouTube..."
              className="w-full bg-[#140b08] border border-[#3e2a22] rounded-xl p-2.5 text-amber-100"
            />
          </div>

          <div>
            <label className="font-bold text-amber-300 block mb-1">Task Description</label>
            <textarea
              rows={2}
              value={taskDesc}
              onChange={e => setTaskDesc(e.target.value)}
              placeholder="Instructions for user..."
              className="w-full bg-[#140b08] border border-[#3e2a22] rounded-xl p-2.5 text-amber-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-bold text-amber-300 block mb-1">Reward Coins</label>
              <input
                type="number"
                required
                value={taskReward}
                onChange={e => setTaskReward(Number(e.target.value))}
                className="w-full bg-[#140b08] border border-[#3e2a22] rounded-xl p-2.5 text-amber-100 font-mono"
              />
            </div>
            <div>
              <label className="font-bold text-amber-300 block mb-1">Type</label>
              <select
                value={taskType}
                onChange={e => setTaskType(e.target.value as 'one_time' | 'daily')}
                className="w-full bg-[#140b08] border border-[#3e2a22] rounded-xl p-2.5 text-amber-100"
              >
                <option value="one_time">One Time Task</option>
                <option value="daily">Daily Task</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-amber-300 block mb-1">Action Link / URL</label>
            <input
              type="url"
              value={taskUrl}
              onChange={e => setTaskUrl(e.target.value)}
              placeholder="https://t.me/xnrewared"
              className="w-full bg-[#140b08] border border-[#3e2a22] rounded-xl p-2.5 text-amber-100 font-mono"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="proofCheck"
              checked={taskRequiresProof}
              onChange={e => setTaskRequiresProof(e.target.checked)}
              className="accent-amber-500 w-4 h-4 cursor-pointer"
            />
            <label htmlFor="proofCheck" className="text-amber-200 font-bold cursor-pointer">
              Requires Screenshot Proof Upload?
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-black font-extrabold py-3 rounded-2xl shadow-lg mt-2 hover:from-amber-400 hover:to-orange-400 transition-all cursor-pointer"
          >
            Publish New Task
          </button>
        </form>
      )}

      {/* 4. API Keys & Settings Tab */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="bg-[#211410] p-4 rounded-3xl border border-[#442f26] shadow-xl space-y-3 text-xs">
          <h2 className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-2">
            <Key className="w-4 h-4 text-amber-400" />
            <span>API Keys & System Configuration</span>
          </h2>

          <div>
            <label className="font-bold text-amber-300 flex items-center gap-1.5 mb-1">
              <ImageIcon className="w-4 h-4 text-amber-400" />
              <span>ImgBB API Key (Image Hosting)</span>
            </label>
            <input
              type="text"
              value={imgbbKey}
              onChange={e => setImgbbKey(e.target.value)}
              placeholder="Enter ImgBB API key..."
              className="w-full bg-[#140b08] border border-[#3e2a22] rounded-xl p-2.5 text-amber-100 font-mono"
            />
            <p className="text-[10px] text-amber-300/60 mt-1">
              Get free key at <a href="https://api.imgbb.com/" target="_blank" rel="noreferrer" className="text-amber-400 underline">api.imgbb.com</a> for image proof uploads.
            </p>
          </div>

          <div>
            <label className="font-bold text-amber-300 flex items-center gap-1.5 mb-1">
              <Mail className="w-4 h-4 text-amber-400" />
              <span>Brevo API Key (OTP Emails)</span>
            </label>
            <input
              type="text"
              value={brevoKey}
              onChange={e => setBrevoKey(e.target.value)}
              placeholder="xkeysib-..."
              className="w-full bg-[#140b08] border border-[#3e2a22] rounded-xl p-2.5 text-amber-100 font-mono"
            />
          </div>

          <div>
            <label className="font-bold text-amber-300 flex items-center gap-1.5 mb-1">
              <Lock className="w-4 h-4 text-amber-400" />
              <span>Resend API Key (Backup OTP)</span>
            </label>
            <input
              type="text"
              value={resendKey}
              onChange={e => setResendKey(e.target.value)}
              placeholder="re_..."
              className="w-full bg-[#140b08] border border-[#3e2a22] rounded-xl p-2.5 text-amber-100 font-mono"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-black font-extrabold py-3 rounded-2xl shadow-lg mt-2 hover:from-amber-400 hover:to-orange-400 transition-all cursor-pointer"
          >
            Save Admin API Configuration
          </button>
        </form>
      )}

      {/* 5. Users Management Tab */}
      {activeTab === 'users' && (
        <div className="bg-[#211410] p-4 rounded-3xl border border-[#442f26] shadow-xl space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" />
              <span>User Database Management ({users.length})</span>
            </h2>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-amber-400 absolute left-3 top-3" />
            <input
              type="text"
              value={userSearch}
              onChange={e => setUserSearch(e.target.value)}
              placeholder="Search user by name, email, referral code..."
              className="w-full bg-[#140b08] border border-[#3e2a22] rounded-xl pl-9 pr-3 py-2.5 text-amber-100 placeholder-amber-300/40 font-mono"
            />
          </div>

          {/* Users List */}
          <div className="space-y-3 mt-3">
            {users
              .filter(u =>
                userSearch.trim() === '' ||
                u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
                u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
                (u.referralCode && u.referralCode.toLowerCase().includes(userSearch.toLowerCase()))
              )
              .map(u => (
                <div
                  key={u.id}
                  className={`bg-[#140b08] p-3.5 rounded-2xl border space-y-2.5 transition-all ${
                    u.isBanned ? 'border-rose-500/50 bg-rose-950/10' : 'border-[#38251e]'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center font-black text-white text-sm shadow overflow-hidden shrink-0 border border-amber-300/30">
                        {u.avatar ? (
                          <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                        ) : (
                          <span>{u.name.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div>
                        <div className="font-extrabold text-amber-100 flex items-center gap-1.5">
                          <span>{u.name}</span>
                          {u.role === 'admin' && (
                            <span className="text-[9px] bg-amber-500/30 text-amber-300 px-1.5 rounded font-mono font-bold border border-amber-500/40">
                              ADMIN
                            </span>
                          )}
                          {u.isBanned && (
                            <span className="text-[9px] bg-rose-500/30 text-rose-300 px-1.5 rounded font-mono font-bold border border-rose-500/40">
                              BANNED
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-amber-300/60 font-mono">{u.email}</div>
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <div className="text-amber-400 font-extrabold">{u.balance.toLocaleString()} Coins</div>
                      <div className="text-[10px] text-amber-300/60">Ref Code: {u.referralCode || 'N/A'}</div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-2 border-t border-[#2d1e18] flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const val = prompt(`Enter coin amount to ADD (+) or REMOVE (-) for ${u.name}:`, '10000');
                          if (val !== null) {
                            const num = parseInt(val, 10);
                            if (!isNaN(num)) handleAdjustBalance(u.id, num);
                          }
                        }}
                        className="bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                        title="Add/Subtract Coins"
                      >
                        <Coins className="w-3.5 h-3.5 text-amber-400" />
                        <span>Add Balance</span>
                      </button>

                      <button
                        onClick={() => {
                          const val = prompt(`Enter referral count to ADD (+) for ${u.name}:`, '1');
                          if (val !== null) {
                            const num = parseInt(val, 10);
                            if (!isNaN(num)) handleAdjustReferrals(u.id, num);
                          }
                        }}
                        className="bg-orange-500/20 text-orange-300 hover:bg-orange-500/30 border border-orange-500/40 px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                        title="Add Verified Referrals"
                      >
                        <UserPlus className="w-3.5 h-3.5 text-orange-400" />
                        <span>Add Ref</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleBan(u.id, !!u.isBanned)}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 cursor-pointer border ${
                          u.isBanned
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                        }`}
                      >
                        <Ban className="w-3.5 h-3.5" />
                        <span>{u.isBanned ? 'Unban User' : 'Ban User'}</span>
                      </button>

                      <button
                        onClick={() => handleDeleteUser(u.id, u.name)}
                        className="bg-rose-950 text-rose-400 hover:bg-rose-900 border border-rose-800 px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                        title="Delete User"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

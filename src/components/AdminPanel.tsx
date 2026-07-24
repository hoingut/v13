import React, { useState, useEffect } from 'react';
import { SystemSettings, TaskSubmission } from '../types';
import {
  fetchAdminSettingsApi,
  updateAdminSettingsApi,
  fetchAdminSubmissionsApi,
  reviewSubmissionApi,
  createAdminTaskApi,
} from '../lib/api';
import { ShieldCheck, Key, Mail, CheckCircle, XCircle, Plus, Sparkles, X, Image as ImageIcon } from 'lucide-react';

interface AdminPanelProps {
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);
  const [activeTab, setActiveTab] = useState<'settings' | 'submissions' | 'add_task'>('submissions');

  // Form states
  const [imgbbKey, setImgbbKey] = useState('');
  const [brevoKey, setBrevoKey] = useState('');
  const [resendKey, setResendKey] = useState('');
  const [brevoLimit, setBrevoLimit] = useState(290);
  const [resendLimit, setResendLimit] = useState(98);

  // New task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskReward, setTaskReward] = useState(100);
  const [taskType, setTaskType] = useState<'one_time' | 'daily'>('one_time');
  const [taskCategory, setTaskCategory] = useState<'telegram' | 'youtube' | 'social'>('social');
  const [taskUrl, setTaskUrl] = useState('');
  const [taskRequiresProof, setTaskRequiresProof] = useState(true);

  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
    loadSubmissions();
  }, []);

  const loadSettings = async () => {
    const res = await fetchAdminSettingsApi();
    if (res.settings) {
      setSettings(res.settings);
      setImgbbKey(res.settings.imgbbApiKey || '');
      setBrevoKey(res.settings.brevoApiKey || '');
      setResendKey(res.settings.resendApiKey || '');
      setBrevoLimit(res.settings.brevoDailyLimit || 290);
      setResendLimit(res.settings.resendDailyLimit || 98);
    }
  };

  const loadSubmissions = async () => {
    const res = await fetchAdminSubmissionsApi();
    if (res.submissions) {
      setSubmissions(res.submissions);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await updateAdminSettingsApi({
      imgbbApiKey: imgbbKey,
      brevoApiKey: brevoKey,
      resendApiKey: resendKey,
      brevoDailyLimit: brevoLimit,
      resendDailyLimit: resendLimit,
    });

    if (res.success) {
      setMessage('Admin settings & API keys updated!');
      loadSettings();
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleReviewSubmission = async (id: string, status: 'approved' | 'rejected') => {
    const res = await reviewSubmissionApi(id, status);
    if (res.success) {
      setMessage(`Submission marked as ${status}`);
      loadSubmissions();
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await createAdminTaskApi({
      title: taskTitle,
      description: taskDesc,
      reward: taskReward,
      type: taskType,
      category: taskCategory,
      actionUrl: taskUrl,
      requiresProof: taskRequiresProof,
    });

    if (res.success) {
      setMessage('New Task Created Successfully!');
      setTaskTitle('');
      setTaskDesc('');
      setTaskUrl('');
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#211511] border border-[#4d352b] rounded-3xl p-5 w-full max-w-lg text-amber-50 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-amber-400 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-2 text-xl font-black text-amber-100 mb-2">
          <ShieldCheck className="w-6 h-6 text-amber-400" />
          <span>NXB Admin Control Panel</span>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 bg-[#170d0a] p-1.5 rounded-2xl border border-[#3b271f]">
          <button
            onClick={() => setActiveTab('submissions')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl ${
              activeTab === 'submissions' ? 'bg-amber-500 text-black' : 'text-amber-200/60'
            }`}
          >
            Proof Reviews ({submissions.filter(s => s.status === 'pending').length})
          </button>
          <button
            onClick={() => setActiveTab('add_task')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl ${
              activeTab === 'add_task' ? 'bg-amber-500 text-black' : 'text-amber-200/60'
            }`}
          >
            Create Task
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl ${
              activeTab === 'settings' ? 'bg-amber-500 text-black' : 'text-amber-200/60'
            }`}
          >
            API & SMTP Settings
          </button>
        </div>

        {message && (
          <div className="bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs p-3 rounded-2xl flex items-center gap-2 my-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{message}</span>
          </div>
        )}

        {/* Tab 1: Proof Submissions */}
        {activeTab === 'submissions' && (
          <div className="flex flex-col gap-3 my-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300">
              Pending Task Proof Submissions
            </h3>

            {submissions.filter(s => s.status === 'pending').length === 0 ? (
              <p className="text-xs text-amber-300/50 py-4 text-center">No pending task proofs to review.</p>
            ) : (
              submissions.filter(s => s.status === 'pending').map(sub => (
                <div key={sub.id} className="bg-[#1a0f0c] p-3 rounded-2xl border border-[#3e2920] flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-amber-100">{sub.userName} ({sub.userEmail})</span>
                    <span className="text-[10px] text-amber-300/60">{new Date(sub.submittedAt).toLocaleTimeString()}</span>
                  </div>

                  {sub.proofImageUrl && (
                    <div className="my-1 border border-[#483025] rounded-xl overflow-hidden bg-black/40 p-2">
                      <img src={sub.proofImageUrl} alt="Proof" className="max-h-48 object-contain rounded-lg mx-auto" />
                      <a href={sub.proofImageUrl} target="_blank" rel="noreferrer" className="text-[10px] text-amber-400 underline block mt-1 text-center">
                        View Full Screenshot Image
                      </a>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 mt-1">
                    <button
                      onClick={() => handleReviewSubmission(sub.id, 'rejected')}
                      className="bg-rose-500/20 text-rose-300 border border-rose-500/40 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 hover:bg-rose-500/30"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                    <button
                      onClick={() => handleReviewSubmission(sub.id, 'approved')}
                      className="bg-emerald-500 text-black px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 hover:bg-emerald-400"
                    >
                      <CheckCircle className="w-4 h-4" /> Approve & Credit
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Create Task */}
        {activeTab === 'add_task' && (
          <form onSubmit={handleCreateTask} className="flex flex-col gap-3 my-2 text-xs">
            <div>
              <label className="font-bold text-amber-300 block mb-1">Task Title</label>
              <input
                type="text"
                required
                value={taskTitle}
                onChange={e => setTaskTitle(e.target.value)}
                placeholder="e.g. Follow NXB Official Twitter"
                className="w-full bg-[#180e0b] border border-[#3e2a22] rounded-xl p-2.5 text-amber-100"
              />
            </div>

            <div>
              <label className="font-bold text-amber-300 block mb-1">Description</label>
              <textarea
                required
                value={taskDesc}
                onChange={e => setTaskDesc(e.target.value)}
                placeholder="Task instructions for user..."
                className="w-full bg-[#180e0b] border border-[#3e2a22] rounded-xl p-2.5 text-amber-100 h-16"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-amber-300 block mb-1">$NXB Reward</label>
                <input
                  type="number"
                  required
                  value={taskReward}
                  onChange={e => setTaskReward(Number(e.target.value))}
                  className="w-full bg-[#180e0b] border border-[#3e2a22] rounded-xl p-2.5 text-amber-100 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-amber-300 block mb-1">Task Type</label>
                <select
                  value={taskType}
                  onChange={e => setTaskType(e.target.value as any)}
                  className="w-full bg-[#180e0b] border border-[#3e2a22] rounded-xl p-2.5 text-amber-100"
                >
                  <option value="one_time">One-Time Task</option>
                  <option value="daily">Daily Task</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-bold text-amber-300 block mb-1">Target Action URL</label>
              <input
                type="url"
                value={taskUrl}
                onChange={e => setTaskUrl(e.target.value)}
                placeholder="https://t.me/your_channel"
                className="w-full bg-[#180e0b] border border-[#3e2a22] rounded-xl p-2.5 text-amber-100 font-mono"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="reqProof"
                checked={taskRequiresProof}
                onChange={e => setTaskRequiresProof(e.target.checked)}
                className="w-4 h-4 accent-amber-500 rounded"
              />
              <label htmlFor="reqProof" className="font-semibold text-amber-200">
                Requires Proof Screenshot (Uploaded via ImgBB)
              </label>
            </div>

            <button
              type="submit"
              className="bg-gradient-to-r from-amber-500 to-orange-500 text-black font-extrabold py-3 rounded-2xl shadow-lg mt-2 hover:from-amber-400 hover:to-orange-400"
            >
              Publish New Task
            </button>
          </form>
        )}

        {/* Tab 3: API Keys & SMTP Config */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="flex flex-col gap-3 my-2 text-xs">
            {/* ImgBB Key */}
            <div className="bg-[#180e0b] p-3 rounded-2xl border border-[#3d2820]">
              <label className="font-bold text-amber-300 flex items-center gap-1.5 mb-1">
                <ImageIcon className="w-4 h-4 text-amber-400" />
                <span>ImgBB API Key (Task Proof Image Host)</span>
              </label>
              <input
                type="text"
                value={imgbbKey}
                onChange={e => setImgbbKey(e.target.value)}
                placeholder="Enter ImgBB API key..."
                className="w-full bg-[#110907] border border-[#311f18] rounded-xl p-2 text-amber-100 font-mono text-xs"
              />
            </div>

            {/* Brevo SMTP Key */}
            <div className="bg-[#180e0b] p-3 rounded-2xl border border-[#3d2820]">
              <label className="font-bold text-amber-300 flex items-center gap-1.5 mb-1">
                <Mail className="w-4 h-4 text-amber-400" />
                <span>Brevo API Key (SMTP Provider 1)</span>
              </label>
              <input
                type="password"
                value={brevoKey}
                onChange={e => setBrevoKey(e.target.value)}
                placeholder="xkeysib-..."
                className="w-full bg-[#110907] border border-[#311f18] rounded-xl p-2 text-amber-100 font-mono text-xs"
              />
              <div className="flex justify-between items-center mt-2 text-[11px] text-amber-300/70">
                <span>Daily Limit: {settings?.brevoDailyLimit || 290}</span>
                <span>Used Today: {settings?.brevoUsedToday || 0}</span>
              </div>
            </div>

            {/* Resend SMTP Key */}
            <div className="bg-[#180e0b] p-3 rounded-2xl border border-[#3d2820]">
              <label className="font-bold text-amber-300 flex items-center gap-1.5 mb-1">
                <Mail className="w-4 h-4 text-amber-400" />
                <span>Resend API Key (SMTP Failover Provider 2)</span>
              </label>
              <input
                type="password"
                value={resendKey}
                onChange={e => setResendKey(e.target.value)}
                placeholder="re_..."
                className="w-full bg-[#110907] border border-[#311f18] rounded-xl p-2 text-amber-100 font-mono text-xs"
              />
              <div className="flex justify-between items-center mt-2 text-[11px] text-amber-300/70">
                <span>Daily Limit: {settings?.resendDailyLimit || 98}</span>
                <span>Used Today: {settings?.resendUsedToday || 0}</span>
              </div>
            </div>

            <button
              type="submit"
              className="bg-gradient-to-r from-amber-500 to-orange-500 text-black font-extrabold py-3 rounded-2xl shadow-lg mt-2 hover:from-amber-400 hover:to-orange-400"
            >
              Save Admin API & SMTP Configuration
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

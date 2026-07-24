import React, { useState, useEffect } from 'react';
import { User, Task, TaskSubmission } from '../types';
import { fetchTasksApi, fetchMySubmissionsApi, submitTaskProofApi } from '../lib/api';
import { CheckCircle, Clock, Upload, ExternalLink, Flag, Image as ImageIcon, ShieldCheck, X } from 'lucide-react';

interface TaskListProps {
  user: User | null;
  onUpdateUser: (user: User) => void;
  onOpenAuth: () => void;
}

export const TaskList: React.FC<TaskListProps> = ({ user, onUpdateUser, onOpenAuth }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);
  const [filterTab, setFilterTab] = useState<'all' | 'daily' | 'one_time'>('all');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [proofImageBase64, setProofImageBase64] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    loadTasks();
    if (user) {
      loadMySubmissions();
    }
  }, [user]);

  const loadTasks = async () => {
    const res = await fetchTasksApi();
    if (res.tasks) setTasks(res.tasks);
  };

  const loadMySubmissions = async () => {
    if (!user) return;
    const res = await fetchMySubmissionsApi(user.id);
    if (res.submissions) setSubmissions(res.submissions);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitProof = async () => {
    if (!user) {
      onOpenAuth();
      return;
    }
    if (!selectedTask) return;

    if (selectedTask.requiresProof && !proofImageBase64) {
      setMessage('Please select a screenshot proof image first!');
      return;
    }

    setSubmitting(true);
    const res = await submitTaskProofApi(selectedTask.id, user.id, proofImageBase64);
    setSubmitting(false);

    if (res.success) {
      setMessage(res.message);
      if (res.newBalance !== undefined) {
        onUpdateUser({ ...user, balance: res.newBalance });
      }
      setSelectedTask(null);
      setProofImageBase64('');
      loadMySubmissions();
    } else {
      setMessage(res.error || 'Failed to submit proof');
    }
  };

  const filteredTasks = tasks.filter(t => {
    if (filterTab === 'daily') return t.type === 'daily';
    if (filterTab === 'one_time') return t.type === 'one_time';
    return true;
  });

  const getTaskStatus = (taskId: string) => {
    const sub = submissions.find(s => s.taskId === taskId);
    if (!sub) return 'available';
    return sub.status; // 'pending' | 'approved' | 'rejected'
  };

  return (
    <div className="flex flex-col gap-4 px-4 pt-2 pb-24 text-amber-50">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#33221b] to-[#241713] p-4 rounded-3xl border border-[#4d352b]/80 shadow-xl flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-amber-100 flex items-center gap-2">
            <Flag className="w-5 h-5 text-amber-400" />
            <span>INCREASE YOUR RATING</span>
          </h2>
          <p className="text-xs text-amber-300/70 mt-1">
            Complete daily tasks, submit proof screenshots, and earn bonus $NXB coins!
          </p>
        </div>
        <img
          src="/src/assets/images/nxb_golden_coin_1784869821261.jpg"
          alt="Coins"
          className="w-12 h-12 rounded-2xl shadow-lg border border-amber-400/40"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-[#251814]/90 p-1.5 rounded-2xl border border-[#443027]">
        <button
          onClick={() => setFilterTab('all')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
            filterTab === 'all' ? 'bg-amber-500 text-black shadow-md' : 'text-amber-200/60 hover:text-amber-100'
          }`}
        >
          All Tasks
        </button>
        <button
          onClick={() => setFilterTab('daily')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
            filterTab === 'daily' ? 'bg-amber-500 text-black shadow-md' : 'text-amber-200/60 hover:text-amber-100'
          }`}
        >
          Daily Tasks
        </button>
        <button
          onClick={() => setFilterTab('one_time')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
            filterTab === 'one_time' ? 'bg-amber-500 text-black shadow-md' : 'text-amber-200/60 hover:text-amber-100'
          }`}
        >
          One-Time
        </button>
      </div>

      {/* Message Toast */}
      {message && (
        <div className="bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs p-3 rounded-2xl flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage(null)} className="text-amber-400 font-bold">✕</button>
        </div>
      )}

      {/* Task List Items */}
      <div className="flex flex-col gap-3">
        {filteredTasks.map(task => {
          const status = getTaskStatus(task.id);
          return (
            <div
              key={task.id}
              className="bg-[#2a1d18]/90 backdrop-blur-md p-3.5 rounded-2xl border border-[#4a342b]/70 flex items-center justify-between gap-3 shadow-lg hover:border-amber-500/40 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600/30 to-orange-600/30 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Flag className="w-5 h-5" />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-amber-100">{task.title}</h3>
                  <p className="text-[11px] text-amber-300/60 line-clamp-1">{task.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-black text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/20">
                  +{task.reward.toLocaleString()}
                </span>

                {status === 'approved' ? (
                  <span className="flex items-center gap-1 text-[11px] bg-emerald-500/20 text-emerald-300 px-3 py-1.5 rounded-xl font-bold border border-emerald-500/30">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Done</span>
                  </span>
                ) : status === 'pending' ? (
                  <span className="flex items-center gap-1 text-[11px] bg-amber-500/20 text-amber-300 px-3 py-1.5 rounded-xl font-bold border border-amber-500/30">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Pending</span>
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      if (!user) {
                        onOpenAuth();
                      } else {
                        setSelectedTask(task);
                        if (task.actionUrl) {
                          window.open(task.actionUrl, '_blank');
                        }
                      }
                    }}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 text-black font-extrabold text-xs px-3.5 py-1.5 rounded-xl hover:from-amber-400 hover:to-orange-400 transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    Start
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Proof Submission Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#241713] border border-[#4d352b] rounded-3xl p-5 w-full max-w-sm text-amber-50 flex flex-col gap-4 shadow-2xl relative">
            <button
              onClick={() => setSelectedTask(null)}
              className="absolute top-4 right-4 text-amber-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-amber-100 flex items-center gap-2">
              <Upload className="w-5 h-5 text-amber-400" />
              <span>Submit Task Screenshot Proof</span>
            </h3>

            <div className="bg-[#1c110d] p-3 rounded-2xl border border-[#3a271f] text-xs">
              <p className="font-bold text-amber-200">{selectedTask.title}</p>
              <p className="text-amber-300/70 mt-1">{selectedTask.description}</p>
              <div className="mt-2 text-amber-400 font-mono font-bold">Reward: +{selectedTask.reward} $NXB</div>
            </div>

            {selectedTask.requiresProof ? (
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-amber-300">
                  Upload Screenshot Proof (Hosted via ImgBB):
                </label>
                <div className="border-2 border-dashed border-[#543b30] hover:border-amber-500/60 rounded-2xl p-4 text-center cursor-pointer bg-[#1e130f] transition-all relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  {proofImageBase64 ? (
                    <div className="flex flex-col items-center gap-2">
                      <img src={proofImageBase64} alt="Proof" className="w-32 h-32 object-cover rounded-xl border border-amber-500/40" />
                      <span className="text-xs text-emerald-400 font-semibold">Screenshot Selected ✓</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-amber-300/70">
                      <ImageIcon className="w-8 h-8 text-amber-400/80" />
                      <span className="text-xs font-medium">Click to select screenshot image</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-amber-300/80">This task does not require screenshot proof. Click submit to claim reward!</p>
            )}

            <button
              onClick={handleSubmitProof}
              disabled={submitting}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-black font-extrabold py-3 rounded-2xl shadow-lg hover:from-amber-400 hover:to-orange-400 transition-all disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Uploading ImgBB & Submitting...' : 'Submit Proof Screenshot'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

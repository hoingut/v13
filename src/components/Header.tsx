import React, { useState } from 'react';
import { User } from '../types';
import { TabType } from './Navbar';
import { uploadAvatarApi } from '../lib/api';
import { ShieldCheck, User as UserIcon, Sparkles, Wallet, Menu, X, CheckSquare, History, Gamepad2, Gift, Trophy, Zap, LogOut, Send, MessageCircle, Camera, Loader2 } from 'lucide-react';

interface HeaderProps {
  user: User | null;
  onUpdateUser?: (user: User) => void;
  onOpenAuth: () => void;
  onOpenAdmin: () => void;
  onOpenWithdraw: () => void;
  onSelectTab?: (tab: TabType) => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onUpdateUser,
  onOpenAuth,
  onOpenAdmin,
  onOpenWithdraw,
  onSelectTab,
  onLogout,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);

  const handleNavClick = (tab: TabType) => {
    if (onSelectTab) {
      onSelectTab(tab);
    }
    setDrawerOpen(false);
  };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      alert('অনুগ্রহ করে একটি ইমেজ ফাইল নির্বাচন করুন (JPEG, PNG)');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      alert('ইমেজ সাইজ ৮MB এর নিচে হতে হবে');
      return;
    }

    setIsUploading(true);
    setUploadMsg('Uploading DP via ImgBB...');

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const res = await uploadAvatarApi(user.id, base64);
        setIsUploading(false);
        if (res.success && res.user && onUpdateUser) {
          onUpdateUser(res.user);
          setUploadMsg('DP successfully updated!');
          setTimeout(() => setUploadMsg(null), 3000);
        } else {
          setUploadMsg(res.error || 'Failed to upload DP');
          setTimeout(() => setUploadMsg(null), 3000);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Avatar upload error:', err);
      setIsUploading(false);
      setUploadMsg('Error uploading image');
      setTimeout(() => setUploadMsg(null), 3000);
    }
  };

  return (
    <>
      <header className="px-4 pt-3 pb-2 flex items-center justify-between text-amber-50 relative z-30">
        {/* Left: Menu Toggle + Profile */}
        <div className="flex items-center gap-2">
          {/* Top-Left Professional Toggle Menu Button */}
          <button
            onClick={() => setDrawerOpen(!drawerOpen)}
            className="w-10 h-10 rounded-2xl bg-gradient-to-b from-[#34231b] to-[#211510] border border-[#52382c] flex items-center justify-center text-amber-300 hover:text-white shadow-xl active:scale-95 cursor-pointer transition-all hover:border-amber-500/60"
            title="Open Menu"
          >
            <Menu className="w-5 h-5 text-amber-400" />
          </button>

          {user ? (
            <div
              onClick={() => handleNavClick('account')}
              className="flex items-center gap-2.5 bg-[#2a1d18]/90 backdrop-blur-md p-1.5 pr-3 rounded-2xl border border-[#4a342a]/80 shadow-lg cursor-pointer hover:border-amber-500/50 transition-all"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center font-black text-white shadow-md relative overflow-hidden text-sm shrink-0 border border-amber-300/30">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{user.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-amber-100">@{user.name.toLowerCase().replace(/\s+/g, '')}</span>
                  {user.role === 'admin' && (
                    <span className="text-[9px] bg-orange-500/30 text-orange-300 px-1 py-0.2 rounded font-semibold border border-orange-500/40">
                      ADMIN
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-amber-400/80 flex items-center gap-1 font-mono">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>Verified</span>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white px-3 py-2 rounded-2xl font-medium text-xs shadow-lg transition-all border border-amber-400/30 active:scale-95 cursor-pointer"
            >
              <UserIcon className="w-4 h-4" />
              <span>Login</span>
            </button>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Quick Telegram Helpline Widget */}
          <a
            href="https://t.me/xnhelpline"
            target="_blank"
            rel="noreferrer"
            className="bg-[#0088cc]/20 text-[#38bdf8] border border-[#0088cc]/40 px-2.5 py-1.5 rounded-xl text-xs font-bold hover:bg-[#0088cc]/30 transition-all flex items-center gap-1 shadow-md"
            title="Telegram Helpline Support"
          >
            <Send className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span className="hidden sm:inline">Support</span>
          </a>

          {user && (
            <button
              onClick={onOpenWithdraw}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 text-black font-extrabold px-3 py-1.5 rounded-xl text-xs shadow-md border border-emerald-400/50 hover:from-emerald-400 hover:to-teal-500 transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Withdraw</span>
            </button>
          )}

          {user?.role === 'admin' && (
            <button
              onClick={onOpenAdmin}
              className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-1.5 rounded-xl text-xs font-semibold hover:bg-amber-500/30 transition-all flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Admin</span>
            </button>
          )}
        </div>
      </header>

      {/* Professional Slide Drawer Overlay & Menu */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex">
          {/* Drawer Content */}
          <div className="w-78 max-w-[85vw] h-full bg-[#180e0a] border-r border-[#4d362c] p-4 flex flex-col justify-between shadow-2xl relative overflow-y-auto">
            <div>
              {/* Header inside drawer */}
              <div className="flex items-center justify-between pb-3 border-b border-[#3d2921] mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center font-black text-black text-base shadow-lg border border-amber-300/40">
                    XN
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-amber-100 flex items-center gap-1">
                      <span>XN Reward App</span>
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => setDrawerOpen(false)}
                  className="w-8 h-8 rounded-xl bg-[#2b1c16] text-amber-300 hover:text-white flex items-center justify-center border border-[#483228]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Professional Profile Details Banner inside drawer */}
              {user ? (
                <div className="bg-gradient-to-br from-[#291a14] to-[#1d120d] p-3.5 rounded-2xl border border-amber-500/30 mb-3 shadow-inner relative">
                  <div className="flex items-center gap-3">
                    <div className="relative group shrink-0">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center font-black text-white text-lg shadow-md border border-amber-300/30 overflow-hidden">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          <span>{user.name.charAt(0).toUpperCase()}</span>
                        )}
                      </div>

                      {/* ImgBB DP Camera Overlay */}
                      <label
                        htmlFor="drawer-dp-upload"
                        className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-amber-500 hover:bg-amber-400 text-black flex items-center justify-center shadow-lg cursor-pointer border border-amber-200 transition-all ${
                          isUploading ? 'opacity-50 pointer-events-none' : ''
                        }`}
                        title="Upload DP via ImgBB"
                      >
                        {isUploading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Camera className="w-3.5 h-3.5" />
                        )}
                        <input
                          id="drawer-dp-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarFileChange}
                          disabled={isUploading}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-black text-amber-100 truncate">{user.name}</div>
                      <div className="text-[10px] text-amber-300/60 font-mono truncate">{user.email}</div>
                      <div className="text-[9px] text-emerald-400 font-mono flex items-center gap-1 mt-0.5">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        <span>Gmail Verified Account</span>
                      </div>
                    </div>
                  </div>

                  {uploadMsg && (
                    <div className="mt-2 text-[10px] text-amber-300 bg-amber-950/60 p-1.5 rounded-lg border border-amber-500/30 font-mono text-center animate-pulse">
                      {uploadMsg}
                    </div>
                  )}

                  <div className="mt-3 pt-2 border-t border-[#3e281e] flex items-center justify-between text-xs font-mono">
                    <span className="text-amber-300/70">Coins Balance:</span>
                    <span className="font-black text-amber-400">{user.balance.toLocaleString()} Coins</span>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => { setDrawerOpen(false); onOpenAuth(); }}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-black font-extrabold py-2.5 rounded-2xl text-xs mb-3 shadow-lg hover:from-amber-400 hover:to-orange-400"
                >
                  Login / Signup with Gmail
                </button>
              )}

              {/* Official Community & Support Shortcuts */}
              <div className="space-y-1.5 mb-3">
                <a
                  href="https://t.me/xnhelpline"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full p-2.5 rounded-xl bg-[#0088cc]/10 hover:bg-[#0088cc]/20 border border-[#0088cc]/30 text-[#38bdf8] text-xs font-bold flex items-center justify-between transition-all"
                >
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-[#38bdf8]" />
                    <span>Telegram Support Helpline</span>
                  </div>
                  <span className="text-[10px] bg-[#0088cc]/20 px-2 py-0.5 rounded font-mono">@xnhelpline</span>
                </a>

                <a
                  href="https://t.me/xnrewared"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full p-2.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-300 text-xs font-bold flex items-center justify-between transition-all"
                >
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4 text-orange-400" />
                    <span>Official Telegram Channel</span>
                  </div>
                  <span className="text-[10px] bg-orange-500/20 px-2 py-0.5 rounded font-mono">@xnrewared</span>
                </a>
              </div>

              {/* Navigation Links */}
              <div className="space-y-1 text-xs">
                <button
                  onClick={() => handleNavClick('task')}
                  className="w-full p-2.5 rounded-xl bg-[#231510] hover:bg-amber-500/20 text-amber-200 hover:text-amber-300 font-medium flex items-center gap-2.5 transition-all"
                >
                  <CheckSquare className="w-4 h-4 text-amber-400" />
                  <span>📋 Daily Tasks & Check-in</span>
                </button>

                <button
                  onClick={() => handleNavClick('history')}
                  className="w-full p-2.5 rounded-xl bg-[#231510] hover:bg-amber-500/20 text-amber-200 hover:text-amber-300 font-medium flex items-center gap-2.5 transition-all"
                >
                  <History className="w-4 h-4 text-amber-400" />
                  <span>📜 Submissions & Cashout History</span>
                </button>

                <button
                  onClick={() => handleNavClick('airdrop')}
                  className="w-full p-2.5 rounded-xl bg-[#231510] hover:bg-amber-500/20 text-amber-200 hover:text-amber-300 font-medium flex items-center gap-2.5 transition-all"
                >
                  <Gamepad2 className="w-4 h-4 text-amber-400" />
                  <span>🎮 AirDrop HedHog Mining</span>
                </button>

                <button
                  onClick={() => handleNavClick('withdraw')}
                  className="w-full p-2.5 rounded-xl bg-[#231510] hover:bg-amber-500/20 text-amber-200 hover:text-amber-300 font-medium flex items-center gap-2.5 transition-all"
                >
                  <Wallet className="w-4 h-4 text-emerald-400" />
                  <span>💳 Withdraw Cash (bKash/Nagad)</span>
                </button>

                <button
                  onClick={() => handleNavClick('friends')}
                  className="w-full p-2.5 rounded-xl bg-[#231510] hover:bg-amber-500/20 text-amber-200 hover:text-amber-300 font-medium flex items-center gap-2.5 transition-all"
                >
                  <Gift className="w-4 h-4 text-orange-400" />
                  <span>👥 Referral Friends (10 Taka Bonus)</span>
                </button>

                <button
                  onClick={() => handleNavClick('top')}
                  className="w-full p-2.5 rounded-xl bg-[#231510] hover:bg-amber-500/20 text-amber-200 hover:text-amber-300 font-medium flex items-center gap-2.5 transition-all"
                >
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>🏆 Leaderboard Top Hunters</span>
                </button>

                <button
                  onClick={() => handleNavClick('upgrades')}
                  className="w-full p-2.5 rounded-xl bg-[#231510] hover:bg-amber-500/20 text-amber-200 hover:text-amber-300 font-medium flex items-center gap-2.5 transition-all"
                >
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>⚡ Energy Boosters & Upgrades</span>
                </button>

                <button
                  onClick={() => handleNavClick('account')}
                  className="w-full p-2.5 rounded-xl bg-[#231510] hover:bg-amber-500/20 text-amber-200 hover:text-amber-300 font-medium flex items-center gap-2.5 transition-all"
                >
                  <UserIcon className="w-4 h-4 text-amber-400" />
                  <span>👤 Account Profile & Rules</span>
                </button>
              </div>
            </div>

            {/* Footer inside drawer */}
            <div className="pt-3 border-t border-[#3d2921] space-y-2">
              {user && onLogout && (
                <button
                  onClick={() => { setDrawerOpen(false); onLogout(); }}
                  className="w-full bg-rose-950/60 border border-rose-500/40 text-rose-300 p-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-rose-900/60"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out Account</span>
                </button>
              )}
            </div>
          </div>

          {/* Click outside to close */}
          <div
            className="flex-1 h-full cursor-pointer"
            onClick={() => setDrawerOpen(false)}
          />
        </div>
      )}
    </>
  );
};




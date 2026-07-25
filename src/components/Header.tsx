import React, { useState } from 'react';
import { User } from '../types';
import { TabType } from './Navbar';
import { uploadAvatarApi } from '../lib/api';
import { ShieldCheck, User as UserIcon, Sparkles, Wallet, Menu, X, CheckSquare, History, Gamepad2, Gift, Trophy, Zap, LogOut, Send, MessageCircle, Camera, Loader2, ChevronRight, Play } from 'lucide-react';
import { PwaInstallButton } from './PwaInstallButton';

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
          {/* PWA Install Button */}
          <PwaInstallButton variant="icon" />

          {/* Quick Tutorial Button */}
          <button
            onClick={() => onSelectTab?.('tutorial')}
            className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-1.5 rounded-xl text-xs font-black hover:bg-amber-500/30 transition-all flex items-center gap-1 shadow-md cursor-pointer"
            title="Watch Tutorial Reel"
          >
            <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="hidden sm:inline">ভিডিও</span>
          </button>

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
        </div>
      </header>

      {/* Luxury Professional Slide Drawer Overlay & Menu */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex animate-in fade-in duration-200">
          {/* Drawer Content */}
          <div className="w-80 max-w-[85vw] h-full bg-gradient-to-b from-[#21120b] via-[#160b07] to-[#100503] border-r border-[#5a3826]/70 p-4.5 flex flex-col justify-between shadow-[0_0_50px_rgba(0,0,0,0.9)] relative overflow-y-auto">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-10 left-0 w-40 h-40 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-4">
              {/* Header inside drawer */}
              <div className="flex items-center justify-between pb-3.5 border-b border-[#4d2d1e]">
                <div className="flex items-center gap-2.5">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center font-black text-black text-lg shadow-lg border-2 border-amber-300/80">
                    XN
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-amber-100 flex items-center gap-1.5 tracking-wide">
                      <span>XN Reward App</span>
                      <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                    </h3>
                    <p className="text-[10px] text-amber-300/70 font-mono">Official Telegram Mini-App</p>
                  </div>
                </div>

                <button
                  onClick={() => setDrawerOpen(false)}
                  className="w-9 h-9 rounded-2xl bg-[#2a1710] text-amber-300 hover:text-white hover:bg-rose-950/60 hover:border-rose-500/50 flex items-center justify-center border border-[#4d2d1e] transition-all cursor-pointer shadow-md"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Professional Profile Details Banner inside drawer */}
              {user ? (
                <div className="bg-gradient-to-br from-[#331d14] via-[#24130d] to-[#150a06] p-4 rounded-3xl border-t border-t-amber-400/60 border-x border-x-amber-500/30 border-b border-b-black/80 shadow-[0_10px_25px_rgba(0,0,0,0.7),0_0_15px_rgba(245,158,11,0.15)] relative overflow-hidden group">
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center font-black text-white text-xl shadow-xl border-2 border-amber-300/80 overflow-hidden">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          <span>{user.name.charAt(0).toUpperCase()}</span>
                        )}
                      </div>

                      {/* ImgBB DP Camera Overlay */}
                      <label
                        htmlFor="drawer-dp-upload"
                        className={`absolute -bottom-1 -right-1 w-6.5 h-6.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black flex items-center justify-center shadow-lg cursor-pointer border-2 border-black transition-all active:scale-95 ${
                          isUploading ? 'opacity-50 pointer-events-none' : ''
                        }`}
                        title="Upload DP via ImgBB"
                      >
                        {isUploading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Camera className="w-3.5 h-3.5 stroke-[2.5]" />
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
                      <div className="flex items-center gap-1.5">
                        <div className="text-sm font-black text-amber-100 truncate">{user.name}</div>
                        {user.role === 'admin' && (
                          <span className="text-[9px] bg-orange-500 text-black font-black px-1.5 py-0.5 rounded-md shadow-sm">
                            ADMIN
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-amber-300/70 font-mono truncate">{user.email}</div>
                      <div className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1 mt-1 bg-emerald-950/80 px-2 py-0.5 rounded-lg border border-emerald-500/40 w-fit">
                        <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span>Verified Account</span>
                      </div>
                    </div>
                  </div>

                  {uploadMsg && (
                    <div className="mt-2.5 text-[11px] text-amber-200 bg-amber-950/90 p-2 rounded-xl border border-amber-500/50 font-mono font-bold text-center animate-pulse shadow-inner">
                      {uploadMsg}
                    </div>
                  )}

                  {/* Dual Balance Indicators */}
                  <div className="mt-3.5 pt-3 border-t border-[#4d2d1e] grid grid-cols-2 gap-2 font-mono">
                    <div className="bg-[#180b07] p-2 rounded-xl border border-amber-500/30">
                      <span className="text-[10px] text-amber-300/70 uppercase block font-sans font-bold">Coins Balance</span>
                      <span className="text-xs font-black text-amber-400">{user.balance.toLocaleString()}</span>
                    </div>
                    <div className="bg-[#101b16] p-2 rounded-xl border border-emerald-500/30">
                      <span className="text-[10px] text-emerald-300/70 uppercase block font-sans font-bold">Taka Balance</span>
                      <span className="text-xs font-black text-emerald-400">৳ {(user.takaBalance || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => { setDrawerOpen(false); onOpenAuth(); }}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black py-3 rounded-2xl text-xs mb-2 shadow-lg hover:from-amber-400 hover:to-orange-400 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>Login / Signup with Gmail</span>
                </button>
              )}

              {/* Official Community & Support Shortcuts */}
              <div className="space-y-2">
                <div className="text-[10px] font-black uppercase tracking-wider text-amber-400/80 px-1">
                  💬 Official Support & Channel
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <a
                    href="https://t.me/xnhelpline"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full p-3 rounded-2xl bg-gradient-to-r from-[#0088cc]/20 to-[#0088cc]/5 hover:from-[#0088cc]/30 border border-[#0088cc]/40 text-[#38bdf8] text-xs font-black flex items-center justify-between transition-all group shadow-md"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-xl bg-[#0088cc]/20 border border-[#38bdf8]/30">
                        <MessageCircle className="w-4 h-4 text-[#38bdf8] group-hover:scale-110 transition-transform" />
                      </div>
                      <span>Telegram Support Helpline</span>
                    </div>
                    <span className="text-[10px] bg-[#061824] px-2 py-1 rounded-lg font-mono border border-[#0088cc]/30">@xnhelpline</span>
                  </a>

                  <a
                    href="https://t.me/xnrewared"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full p-3 rounded-2xl bg-gradient-to-r from-orange-500/20 to-orange-500/5 hover:from-orange-500/30 border border-orange-500/40 text-orange-300 text-xs font-black flex items-center justify-between transition-all group shadow-md"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-xl bg-orange-500/20 border border-orange-400/30">
                        <Send className="w-4 h-4 text-orange-400 group-hover:scale-110 transition-transform" />
                      </div>
                      <span>Official Telegram Channel</span>
                    </div>
                    <span className="text-[10px] bg-[#1a0f0a] px-2 py-1 rounded-lg font-mono border border-orange-500/30">@xnrewared</span>
                  </a>
                </div>
              </div>

              {/* Modular Luxury Navigation Links */}
              <div className="space-y-1.5">
                <div className="pb-1.5">
                  <PwaInstallButton variant="button" className="w-full" />
                </div>

                <div className="text-[10px] font-black uppercase tracking-wider text-amber-400/80 px-1 pt-1">
                  🚀 Main Navigation
                </div>

                <button
                  onClick={() => handleNavClick('tutorial')}
                  className="w-full p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/10 hover:from-amber-500/30 border border-amber-500/40 text-amber-200 font-extrabold text-xs flex items-center justify-between transition-all group shadow-sm cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                      <Play className="w-4 h-4 fill-amber-400" />
                    </div>
                    <span>ভিডিও দেখুন (Tutorial Guide)</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-amber-400/50 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                </button>

                <button
                  onClick={() => handleNavClick('task')}
                  className="w-full p-3 rounded-2xl bg-[#23140e]/90 hover:bg-gradient-to-r hover:from-amber-500/20 hover:to-transparent border border-[#482b1d] hover:border-amber-500/50 text-amber-100 font-bold text-xs flex items-center justify-between transition-all group shadow-sm cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                      <CheckSquare className="w-4 h-4" />
                    </div>
                    <span>Daily Tasks & Check-in</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-amber-400/50 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                </button>

                <button
                  onClick={() => handleNavClick('history')}
                  className="w-full p-3 rounded-2xl bg-[#23140e]/90 hover:bg-gradient-to-r hover:from-amber-500/20 hover:to-transparent border border-[#482b1d] hover:border-amber-500/50 text-amber-100 font-bold text-xs flex items-center justify-between transition-all group shadow-sm cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                      <History className="w-4 h-4" />
                    </div>
                    <span>Submissions & Cashout History</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-amber-400/50 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                </button>

                <button
                  onClick={() => handleNavClick('airdrop')}
                  className="w-full p-3 rounded-2xl bg-[#23140e]/90 hover:bg-gradient-to-r hover:from-orange-500/20 hover:to-transparent border border-[#482b1d] hover:border-orange-500/50 text-amber-100 font-bold text-xs flex items-center justify-between transition-all group shadow-sm cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-orange-500/15 border border-orange-400/30 flex items-center justify-center text-orange-400 group-hover:scale-110 transition-transform">
                      <Gamepad2 className="w-4 h-4" />
                    </div>
                    <span>AirDrop HedHog Mining</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-orange-400/50 group-hover:text-orange-400 group-hover:translate-x-1 transition-all" />
                </button>

                <button
                  onClick={() => handleNavClick('withdraw')}
                  className="w-full p-3 rounded-2xl bg-[#14221a]/90 hover:bg-gradient-to-r hover:from-emerald-500/20 hover:to-transparent border border-[#234834] hover:border-emerald-500/50 text-emerald-100 font-bold text-xs flex items-center justify-between transition-all group shadow-sm cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                      <Wallet className="w-4 h-4" />
                    </div>
                    <span>Withdraw Cash (bKash/Nagad)</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-emerald-400/50 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                </button>

                <button
                  onClick={() => handleNavClick('friends')}
                  className="w-full p-3 rounded-2xl bg-[#23140e]/90 hover:bg-gradient-to-r hover:from-amber-500/20 hover:to-transparent border border-[#482b1d] hover:border-amber-500/50 text-amber-100 font-bold text-xs flex items-center justify-between transition-all group shadow-sm cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                      <Gift className="w-4 h-4" />
                    </div>
                    <span>Referral Friends (10 Taka Bonus)</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-amber-400/50 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                </button>

                <button
                  onClick={() => handleNavClick('top')}
                  className="w-full p-3 rounded-2xl bg-[#23140e]/90 hover:bg-gradient-to-r hover:from-amber-500/20 hover:to-transparent border border-[#482b1d] hover:border-amber-500/50 text-amber-100 font-bold text-xs flex items-center justify-between transition-all group shadow-sm cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                      <Trophy className="w-4 h-4" />
                    </div>
                    <span>Leaderboard Top Hunters</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-amber-400/50 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                </button>

                <button
                  onClick={() => handleNavClick('upgrades')}
                  className="w-full p-3 rounded-2xl bg-[#23140e]/90 hover:bg-gradient-to-r hover:from-amber-500/20 hover:to-transparent border border-[#482b1d] hover:border-amber-500/50 text-amber-100 font-bold text-xs flex items-center justify-between transition-all group shadow-sm cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                      <Zap className="w-4 h-4" />
                    </div>
                    <span>Energy Boosters & Upgrades</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-amber-400/50 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                </button>

                <button
                  onClick={() => handleNavClick('account')}
                  className="w-full p-3 rounded-2xl bg-[#23140e]/90 hover:bg-gradient-to-r hover:from-amber-500/20 hover:to-transparent border border-[#482b1d] hover:border-amber-500/50 text-amber-100 font-bold text-xs flex items-center justify-between transition-all group shadow-sm cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <span>Account Profile & Rules</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-amber-400/50 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                </button>

                {user?.role === 'admin' && (
                  <button
                    onClick={() => { setDrawerOpen(false); onOpenAdmin(); }}
                    className="w-full p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border-2 border-amber-400 text-amber-300 font-black text-xs flex items-center justify-between transition-all group shadow-lg cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-500 text-black flex items-center justify-center font-black group-hover:scale-110 transition-transform shadow-md">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <span>Admin Management Dashboard</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-amber-300 font-black group-hover:translate-x-1 transition-all" />
                  </button>
                )}
              </div>
            </div>

            {/* Footer inside drawer */}
            <div className="relative z-10 pt-4 mt-4 border-t border-[#4d2d1e] space-y-3">
              {user && onLogout && (
                <button
                  onClick={() => { setDrawerOpen(false); onLogout(); }}
                  className="w-full bg-gradient-to-r from-rose-950 via-red-950 to-rose-950 border border-rose-500/50 hover:border-rose-400 text-rose-200 p-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-lg hover:bg-rose-900/60 transition-all cursor-pointer active:scale-95"
                >
                  <LogOut className="w-4 h-4 text-rose-400" />
                  <span>Log Out Account</span>
                </button>
              )}
              <div className="text-center">
                <p className="text-[10px] text-amber-400/50 font-mono">XN Reward v2.4 • Made with Pride</p>
              </div>
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




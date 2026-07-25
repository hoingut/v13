import React from 'react';
import { User } from '../types';
import { TabType } from './Navbar';
import { Sparkles, Play, MessageCircle, Send, Info, X } from 'lucide-react';

interface WelcomePopupProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: TabType) => void;
  supportUrl?: string;
  channelUrl?: string;
  welcomeText?: string;
}

export const WelcomePopup: React.FC<WelcomePopupProps> = ({
  user,
  isOpen,
  onClose,
  onSelectTab,
  supportUrl = 'https://t.me/xnhelpline',
  channelUrl = 'https://t.me/xnrewared',
  welcomeText = 'ভিডিও দেখুন! (Tutorial)',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-sm bg-gradient-to-b from-[#23130d] via-[#160b07] to-[#100603] border-2 border-amber-500/60 rounded-3xl p-6 shadow-[0_0_50px_rgba(245,158,11,0.25)] text-center overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Decorative Golden Glows */}
        <div className="absolute -top-16 -left-16 w-40 h-40 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-40 h-40 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Icon button in top right */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#2a1710] text-amber-300/70 hover:text-white hover:bg-rose-950 flex items-center justify-center border border-[#4d2d1e] transition-all cursor-pointer z-10"
          title="Close Popup"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Welcome Header Section */}
        <div className="relative z-10 space-y-1 mb-6 mt-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-extrabold uppercase tracking-widest shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            <span>Announcement</span>
          </div>
          
          <h2 className="text-3xl font-black text-amber-100 tracking-tight mt-3">
            Welcome,
          </h2>
          <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200 bg-clip-text text-transparent drop-shadow-md truncate px-2">
            ({user ? user.name : 'Guest Hunter'})
          </h1>
        </div>

        {/* Action Buttons Stack */}
        <div className="relative z-10 space-y-3">
          {/* 1. Tutorial Video Button */}
          <button
            onClick={() => {
              onSelectTab('tutorial');
              onClose();
            }}
            className="w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-black font-black text-base sm:text-lg shadow-[0_5px_20px_rgba(245,158,11,0.3)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer border-2 border-amber-300"
          >
            <Play className="w-5 h-5 fill-black stroke-black shrink-0" />
            <span>{welcomeText || 'ভিডিও দেখুন! (Tutorial)'}</span>
          </button>

          {/* 2. Message Support */}
          <a
            href={supportUrl || 'https://t.me/xnhelpline'}
            target="_blank"
            rel="noreferrer"
            className="w-full py-3.5 px-5 rounded-2xl bg-[#25150e]/90 hover:bg-[#341d14] border border-amber-500/40 hover:border-amber-400 text-amber-100 font-extrabold text-sm sm:text-base transition-all flex items-center justify-center gap-2.5 shadow-md active:scale-98"
          >
            <MessageCircle className="w-5 h-5 text-sky-400 shrink-0" />
            <span>সাপোর্টে মেসেজ দিন</span>
          </a>

          {/* 3. Join Channel */}
          <a
            href={channelUrl || 'https://t.me/xnrewared'}
            target="_blank"
            rel="noreferrer"
            className="w-full py-3.5 px-5 rounded-2xl bg-[#25150e]/90 hover:bg-[#341d14] border border-amber-500/40 hover:border-amber-400 text-amber-100 font-extrabold text-sm sm:text-base transition-all flex items-center justify-center gap-2.5 shadow-md active:scale-98"
          >
            <Send className="w-5 h-5 text-orange-400 shrink-0" />
            <span>চ্যানেলে জয়েন করুন</span>
          </a>

          {/* 4. About Us / Learn More */}
          <button
            onClick={() => {
              onSelectTab('account');
              onClose();
            }}
            className="w-full py-3.5 px-5 rounded-2xl bg-[#180d08]/90 hover:bg-[#25150e] border border-[#3e2a22] hover:border-amber-500/50 text-amber-300/90 font-extrabold text-sm sm:text-base transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-sm active:scale-98"
          >
            <Info className="w-5 h-5 text-amber-400 shrink-0" />
            <span>বিস্তারিত জানুন (About us,)</span>
          </button>
        </div>

        {/* Close Button at bottom */}
        <div className="relative z-10 mt-5 pt-3 border-t border-[#3e2a22]/70">
          <button
            onClick={onClose}
            className="w-full py-2 text-center font-black text-amber-400/80 hover:text-white uppercase tracking-widest text-sm transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

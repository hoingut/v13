import React, { useState } from 'react';
import { ChevronRight, Sparkles, Zap, Users, Rocket, Calendar, Gift, Trophy, Coins, Check, X } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFinish: () => void;
}

interface SlideData {
  id: number;
  theme: {
    bgGradient: string;
    cardBg: string;
    borderColor: string;
    glowColor: string;
    titleColor: string;
    subtitleColor: string;
    badgeBg: string;
    badgeText: string;
    buttonBg: string;
    buttonText: string;
  };
  badge: string;
  titleEn: string;
  titleBn: string;
  subtitleEn: string;
  subtitleBn: string;
  icon: React.ReactNode;
  highlightText?: string;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose, onFinish }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  if (!isOpen) return null;

  const slides: SlideData[] = [
    {
      id: 1,
      theme: {
        bgGradient: 'from-[#3a1525] via-[#240d17] to-[#15060d]',
        cardBg: 'bg-[#2a101b]/90',
        borderColor: 'border-rose-500/50',
        glowColor: 'bg-rose-500/20',
        titleColor: 'text-rose-200',
        subtitleColor: 'text-rose-100/80',
        badgeBg: 'bg-rose-500/20 border-rose-400/40 text-rose-300',
        badgeText: 'Step 1 of 3 • Daily Mining',
        buttonBg: 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400',
        buttonText: 'text-white'
      },
      badge: '⚡ DAILY TAP & MINE',
      titleEn: 'Tap & Mine Daily',
      titleBn: 'নিয়মিত ট্যাপ করুন ও মাইন করুন',
      subtitleEn: 'Tap the screen to harvest $NXB tokens! Upgrade your Charge Box and Energy Level for passive mining speed.',
      subtitleBn: 'স্ক্রিনে ট্যাপ করে প্রতিদিন ফ্রি $NXB কয়েন সংগ্রহ করুন! আপনার স্পিড ও এনার্জি লেভেল আপগ্রেড করুন।',
      icon: (
        <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 bg-rose-500/30 rounded-full blur-2xl animate-pulse" />
          <div className="w-32 h-32 rounded-3xl bg-gradient-to-tr from-rose-600 via-pink-500 to-rose-400 border-2 border-rose-200/60 shadow-[0_10px_35px_rgba(244,63,94,0.5)] flex flex-col items-center justify-center text-white transform -rotate-6 hover:rotate-0 transition-transform duration-300">
            <Zap className="w-16 h-16 fill-white drop-shadow-lg animate-bounce" />
            <span className="text-xs font-black tracking-wider mt-1 bg-black/30 px-2.5 py-0.5 rounded-full">$NXB MINE</span>
          </div>
          <div className="absolute -top-2 -right-2 w-12 h-12 rounded-2xl bg-amber-400 border border-white flex items-center justify-center shadow-lg animate-spin" style={{ animationDuration: '8s' }}>
            <Coins className="w-7 h-7 text-black fill-black" />
          </div>
        </div>
      )
    },
    {
      id: 2,
      theme: {
        bgGradient: 'from-[#3b280b] via-[#241705] to-[#140c02]',
        cardBg: 'bg-[#2a1c07]/90',
        borderColor: 'border-amber-500/50',
        glowColor: 'bg-amber-500/20',
        titleColor: 'text-amber-200',
        subtitleColor: 'text-amber-100/80',
        badgeBg: 'bg-amber-500/20 border-amber-400/40 text-amber-300',
        badgeText: 'Step 2 of 3 • Community & Quests',
        buttonBg: 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 hover:from-amber-400 hover:to-orange-400',
        buttonText: 'text-black font-black'
      },
      badge: '🎁 FRIENDS & TASKS',
      titleEn: 'Invite Friends & Earn',
      titleBn: 'বন্ধুদের রেফার ও টাস্ক পূরণ করুন',
      subtitleEn: 'Complete daily Telegram & social quests. Invite friends to build your mining squad and earn 10% lifetime bonuses!',
      subtitleBn: 'সোশ্যাল টাস্ক পূরণ করুন এবং বন্ধুদের ইনভাইট করে স্কোয়াড তৈরি করুন, পান আজীবন ১০% বোনাস ও রিওয়ার্ড!',
      icon: (
        <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 bg-amber-500/30 rounded-full blur-2xl animate-pulse" />
          <div className="w-32 h-32 rounded-3xl bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-400 border-2 border-amber-100/60 shadow-[0_10px_35px_rgba(245,158,11,0.5)] flex flex-col items-center justify-center text-black transform rotate-6 hover:rotate-0 transition-transform duration-300">
            <Users className="w-16 h-16 text-black fill-black/20 drop-shadow-md" />
            <span className="text-xs font-black tracking-wider mt-1 bg-black text-amber-300 px-2.5 py-0.5 rounded-full">+10% BONUS</span>
          </div>
          <div className="absolute -bottom-2 -left-2 w-12 h-12 rounded-2xl bg-rose-500 border border-white flex items-center justify-center shadow-lg animate-bounce">
            <Gift className="w-7 h-7 text-white fill-white/20" />
          </div>
        </div>
      )
    },
    {
      id: 3,
      theme: {
        bgGradient: 'from-[#0b3336] via-[#061f22] to-[#031113]',
        cardBg: 'bg-[#082729]/95',
        borderColor: 'border-cyan-400/60',
        glowColor: 'bg-cyan-500/25',
        titleColor: 'text-cyan-200',
        subtitleColor: 'text-cyan-100/90',
        badgeBg: 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300',
        badgeText: 'Step 3 of 3 • Major Milestone',
        buttonBg: 'bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300',
        buttonText: 'text-black font-black'
      },
      badge: '🚀 GRAND LISTING MILESTONE',
      titleEn: 'Listing in Aug 15',
      titleBn: 'গ্র্যান্ড লিস্টিং ১৫ আগস্ট, ২০২৬!',
      subtitleEn: 'Mark your calendar! $NXB is officially scheduled for global exchange listing on August 15, 2026. Accumulate as many tokens as possible before the snapshot!',
      subtitleBn: 'মনে রাখবেন! আগামী ১৫ আগস্ট, ২০২৬ তারিখে আন্তর্জাতিক এক্সচেঞ্জে $NXB লিস্টিং হচ্ছে। লিস্টিংয়ের আগেই সর্বোচ্চ কয়েন সংগ্রহ করুন!',
      highlightText: '🗓️ AUGUST 15, 2026 • GLOBAL EXCHANGE LAUNCH',
      icon: (
        <div className="relative w-44 h-44 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 bg-cyan-400/30 rounded-full blur-3xl animate-pulse" />
          <div className="w-36 h-36 rounded-3xl bg-gradient-to-tr from-cyan-500 via-teal-500 to-emerald-400 border-2 border-white shadow-[0_10px_40px_rgba(6,182,212,0.6)] flex flex-col items-center justify-center text-black transform scale-105 transition-transform duration-300">
            <Calendar className="w-14 h-14 text-black stroke-[2.5]" />
            <div className="mt-1 bg-black text-cyan-300 px-3 py-1 rounded-xl text-xs font-black tracking-wider shadow-inner flex items-center gap-1">
              <Rocket className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>AUG 15, 2026</span>
            </div>
          </div>
          <div className="absolute -top-3 -left-2 w-14 h-14 rounded-2xl bg-amber-400 border-2 border-black flex flex-col items-center justify-center shadow-xl animate-bounce">
            <Trophy className="w-7 h-7 text-black fill-black" />
          </div>
        </div>
      )
    }
  ];

  const slide = slides[currentSlide];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    try {
      localStorage.setItem('nxb_onboarding_completed_v2', 'true');
    } catch (e) {
      console.error('Error setting onboarding status:', e);
    }
    onFinish();
    onClose();
  };

  const handleSkip = () => {
    handleComplete();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300 select-none">
      <div className={`relative w-full max-w-md min-h-[520px] bg-gradient-to-b ${slide.theme.bgGradient} ${slide.theme.cardBg} border-2 ${slide.theme.borderColor} rounded-[32px] p-6 sm:p-8 shadow-[0_0_60px_rgba(0,0,0,0.8)] flex flex-col justify-between overflow-hidden transition-all duration-500`}>
        
        {/* Ambient background glow */}
        <div className={`absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 ${slide.theme.glowColor} rounded-full blur-3xl pointer-events-none transition-all duration-500`} />

        {/* Top Header Bar: Brand Logo & Skip Button */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center font-black text-black text-base shadow-md border border-amber-200">
              $NXB
            </div>
            <span className="font-extrabold text-sm sm:text-base tracking-wide text-white/90">Airdrop Hunter</span>
          </div>

          <button
            onClick={handleSkip}
            className="text-xs sm:text-sm font-bold text-white/60 hover:text-white px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer flex items-center gap-1"
          >
            <span>Skip</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Central Visual Showcase */}
        <div className="relative z-10 my-6 py-4 flex flex-col items-center justify-center">
          <div className="mb-2">
            <span className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-widest border shadow-sm ${slide.theme.badgeBg}`}>
              <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
              <span>{slide.badge}</span>
            </span>
          </div>

          <div className="my-4">
            {slide.icon}
          </div>
        </div>

        {/* Title, Subtitle & Highlight Section */}
        <div className="relative z-10 text-center space-y-3 px-1">
          <h2 className={`text-2xl sm:text-3xl font-black ${slide.theme.titleColor} tracking-tight leading-tight`}>
            {slide.titleEn}
          </h2>
          <h3 className="text-lg sm:text-xl font-bold text-amber-300 font-serif">
            {slide.titleBn}
          </h3>

          {slide.highlightText && (
            <div className="py-2 px-3 rounded-2xl bg-cyan-950/80 border border-cyan-400/80 text-cyan-300 font-mono font-black text-xs sm:text-sm tracking-wide shadow-[0_0_20px_rgba(6,182,212,0.3)] animate-pulse">
              {slide.highlightText}
            </div>
          )}

          <p className={`text-xs sm:text-sm ${slide.theme.subtitleColor} leading-relaxed font-sans`}>
            {slide.subtitleBn}
          </p>
        </div>

        {/* Bottom Navigation Footer: Step Indicators & Next/Done Button */}
        <div className="relative z-10 mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
          {/* Step Dots */}
          <div className="flex items-center gap-2">
            {slides.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setCurrentSlide(idx)}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  currentSlide === idx
                    ? 'w-8 h-2.5 bg-amber-400 shadow-[0_0_10px_#f59e0b]'
                    : 'w-2.5 h-2.5 bg-white/30 hover:bg-white/50'
                }`}
                title={`Go to slide ${s.id}`}
              />
            ))}
          </div>

          {/* Next / Finish Button */}
          <button
            onClick={handleNext}
            className={`px-6 py-3.5 rounded-2xl ${slide.theme.buttonBg} ${slide.theme.buttonText} text-sm sm:text-base tracking-wide shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2 font-black`}
          >
            <span>{currentSlide === slides.length - 1 ? 'Start Hunting 🚀' : 'Next Step'}</span>
            {currentSlide === slides.length - 1 ? (
              <Check className="w-5 h-5 stroke-[3]" />
            ) : (
              <div className="w-7 h-7 rounded-xl bg-black/20 flex items-center justify-center">
                <ChevronRight className="w-5 h-5 stroke-[3]" />
              </div>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

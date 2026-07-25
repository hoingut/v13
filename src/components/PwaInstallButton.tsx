import React, { useState, useEffect } from 'react';
import { Download, Smartphone, CheckCircle, X, Share2, MoreVertical } from 'lucide-react';

interface PwaInstallButtonProps {
  className?: string;
  variant?: 'button' | 'banner' | 'icon';
}

export const PwaInstallButton: React.FC<PwaInstallButtonProps> = ({
  className = '',
  variant = 'button',
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true) {
      setIsInstalled(true);
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setIsIOS(true);
    }

    // Listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for appinstalled
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setIsInstalled(true);
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.warn('Install prompt error:', err);
        setShowInstructionsModal(true);
      }
    } else {
      // If prompt not available (e.g. iOS or already installed/iframe), show manual guide
      setShowInstructionsModal(true);
    }
  };

  if (isInstalled && variant === 'banner') {
    return null;
  }

  return (
    <>
      {/* 1. Icon Only / Header Small Button */}
      {variant === 'icon' && !isInstalled && (
        <button
          onClick={handleInstallClick}
          className={`bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-1.5 rounded-xl text-xs font-black hover:bg-emerald-500/30 transition-all flex items-center gap-1 shadow-md cursor-pointer animate-pulse ${className}`}
          title="Install XN Reward App"
        >
          <Download className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">অ্যাপ ইনস্টল</span>
        </button>
      )}

      {/* 2. Standard Button */}
      {variant === 'button' && (
        <button
          onClick={handleInstallClick}
          disabled={isInstalled}
          className={`py-3 px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer ${
            isInstalled
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default'
              : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 hover:from-emerald-400 hover:to-teal-400 text-black border-2 border-emerald-300 shadow-[0_5px_20px_rgba(16,185,129,0.3)] hover:scale-[1.02] active:scale-95'
          } ${className}`}
        >
          {isInstalled ? (
            <>
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>অ্যাপ ইনস্টল করা আছে (Installed)</span>
            </>
          ) : (
            <>
              <Smartphone className="w-4 h-4 fill-black stroke-black shrink-0" />
              <span>ফোনে অ্যাপ ইনস্টল করুন (Install PWA)</span>
            </>
          )}
        </button>
      )}

      {/* 3. Full Banner for Navbar or Account page */}
      {variant === 'banner' && !isInstalled && (
        <div className={`bg-gradient-to-r from-[#142319] via-[#103020] to-[#142319] border-2 border-emerald-500/50 rounded-2xl p-4 shadow-lg flex items-center justify-between gap-3 ${className}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shrink-0">
              <Smartphone className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-emerald-200">
                XN Reward অ্যাপ ডাউনলোড করুন!
              </h4>
              <p className="text-[11px] text-emerald-300/80 font-sans">
                ফোনের হোম স্ক্রিনে অ্যাপ ইনস্টল করে দ্রুত মাইনিং ও আয় করুন।
              </p>
            </div>
          </div>
          <button
            onClick={handleInstallClick}
            className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs whitespace-nowrap shadow-md hover:scale-105 transition-all cursor-pointer"
          >
            ইনস্টল (Install)
          </button>
        </div>
      )}

      {/* Manual Installation Instructions Modal */}
      {showInstructionsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-[#160e0a] border-2 border-emerald-500/60 rounded-3xl p-6 shadow-[0_0_50px_rgba(16,185,129,0.25)] text-center space-y-4 animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowInstructionsModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#2a1710] text-amber-300/70 hover:text-white hover:bg-rose-950 flex items-center justify-center border border-[#4d2d1e] transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 mx-auto shadow-inner">
              <Smartphone className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-black text-emerald-200">
                কিভাবে অ্যাপ ইনস্টল করবেন?
              </h3>
              <p className="text-xs text-amber-300/80 mt-1 font-sans">
                আপনার ফোনের হোম স্ক্রিনে XN Reward অ্যাপটি ইনস্টল করার নিয়ম:
              </p>
            </div>

            {isIOS ? (
              <div className="bg-[#1f130e] p-4 rounded-2xl border border-[#3e2316] text-left space-y-2.5 text-xs text-amber-100 font-sans">
                <div className="flex items-start gap-2">
                  <span className="bg-emerald-500/20 text-emerald-400 font-bold px-1.5 py-0.5 rounded text-[11px]">১</span>
                  <span>নিচের বারে বা ব্রাউজারে <strong>Share</strong> বাটন (<Share2 className="w-3.5 h-3.5 inline text-sky-400" />) এ চাপ দিন।</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="bg-emerald-500/20 text-emerald-400 font-bold px-1.5 py-0.5 rounded text-[11px]">২</span>
                  <span>মেনু থেকে নিচের দিকে স্ক্রল করে <strong>"Add to Home Screen"</strong> (হোম স্ক্রিনে যোগ করুন) নির্বাচন করুন।</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="bg-emerald-500/20 text-emerald-400 font-bold px-1.5 py-0.5 rounded text-[11px]">৩</span>
                  <span>উপরে ডানপাশে <strong>Add</strong> বাটনে চাপ দিন!</span>
                </div>
              </div>
            ) : (
              <div className="bg-[#1f130e] p-4 rounded-2xl border border-[#3e2316] text-left space-y-2.5 text-xs text-amber-100 font-sans">
                <div className="flex items-start gap-2">
                  <span className="bg-emerald-500/20 text-emerald-400 font-bold px-1.5 py-0.5 rounded text-[11px]">১</span>
                  <span>ব্রাউজারের উপরে ডানপাশে <strong>৩-ডট মেনু</strong> (<MoreVertical className="w-3.5 h-3.5 inline text-amber-400" />) তে চাপ দিন।</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="bg-emerald-500/20 text-emerald-400 font-bold px-1.5 py-0.5 rounded text-[11px]">২</span>
                  <span>তালিকা থেকে <strong>"Add to Home screen"</strong> বা <strong>"Install app"</strong> নির্বাচন করুন।</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="bg-emerald-500/20 text-emerald-400 font-bold px-1.5 py-0.5 rounded text-[11px]">৩</span>
                  <span>পপ-আপ আসলে <strong>Install</strong> বা <strong>Add</strong> এ চাপ দিন!</span>
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                onClick={() => setShowInstructionsModal(false)}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider shadow-lg transition-all cursor-pointer"
              >
                বুঝেছি (Got It)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
